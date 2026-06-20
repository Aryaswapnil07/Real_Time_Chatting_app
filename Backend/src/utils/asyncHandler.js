const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

// what is next eror 
// Express has a special mechanism.
// means "Skip normal middleware and go directly to error handling middleware."
export { asyncHandler }


// Why use asyncHandler?

// Answer:

// Express does not automatically handle all asynchronous errors. asyncHandler wraps
//  async controllers and forwards errors to Express error middleware using next(error),
//  eliminating the need for repetitive try-catch blocks in every controller.

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }