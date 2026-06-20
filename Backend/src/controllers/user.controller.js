import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh Token and Access Token "
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontend

  const { fullName, email, username, password, bio } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required !");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this email or username is already exists"
    );
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required ");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar ");
  }
  //create user object -create entry in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    email,
    password,
    username: username.trim().toLowerCase(),
    bio,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the User");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Succesfully "));
});

//user registration and all scenario end here

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // console.log(email)
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required ");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //database check hone ke baad ka code
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  // upar wale line me check kiya gya h ki database me user hai bhi ki nhi

  const isPasswordValid = await user.isPasswordCorrect(password);

  // upar wale line me password liya ja rha h

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  // upar wale line me password check ho rha h

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // access Token or refresh Token generate kiya ja rha h upar wale line me

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // upar wale line ke code ka mtlb user logged in ho chuka ha ab scurity purpose ke karan usko iid diya ja rha h or password or refresh token hataya ja rha hai

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

/// ab neeche wala code logout karne ke liye likha ja rha h

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out !!"));
});

// upwar wale me agar logout hua h to usi ka code likha hua h

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request ");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used ");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token ");
  }
});
// neeche wala code pass change ke liye hai

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully "));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched succesfully "));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, bio } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
        bio,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, " Avatar file is missing ");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading Avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password , -refreshToken   ");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});
// search karne ke liye user ko 

const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query?.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const users = await User.find({
    $and: [
      {
        $or: [
          {
            username: {
              $regex: query,
              $options: "i",
            },
          },
          {
            fullName: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      },
      {
        _id: {
          $ne: req.user._id,
        },
      },
    ],
  }).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});
//kisi dusre user ka profile fetch karne ke liye
const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  searchUsers,
  getUserProfile,
};
