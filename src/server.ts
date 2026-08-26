import { env } from "./config";
import app from "./app";

app.listen(env.PORT, () => {
  console.log(`Insurance claims tracker API listening on port ${env.PORT}`);
});
