import { app } from "./app";
import { env, validateRuntimeEnv } from "./config/env";

validateRuntimeEnv();

app.listen(env.port, () => {
  console.log(`Skyline API listening on http://localhost:${env.port}`);
});
