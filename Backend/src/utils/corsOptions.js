const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAllOrigins = configuredOrigins.includes("*");

const corsOrigin = (origin, callback) => {
  if (!origin || allowAllOrigins || configuredOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

export const corsOptions = {
  origin: corsOrigin,
  credentials: true,
};
