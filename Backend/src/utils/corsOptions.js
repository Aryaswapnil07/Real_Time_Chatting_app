const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://real-time-chatting-app-iota.vercel.app",
];

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
};

const configuredOrigins = (process.env.CORS_ORIGIN || defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .map(normalizeOrigin)
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
