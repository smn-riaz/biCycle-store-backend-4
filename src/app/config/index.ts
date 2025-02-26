import dotenv from 'dotenv'
import path from 'path'

dotenv.config({path: path.join(process.cwd(),'.env')})


export default {
    node_dev:process.env.NODE_DEV,
    port:process.env.PORT,
database_url:process.env.DATABASE_URL,
bcrypt_salt_rounds:process.env.BCRYPT_SALT_ROUNDS,
jwt_access_secret:process.env.JWT_ACCESS_SECRET,
jwt_refresh_secret:process.env.JWT_REFRESH_SECRET,
jwt_access_expires_in:process.env.JWT_ACCESS_EXPIRES_IN,
jwt_refresh_expires_in:process.env.JWT_REFRESH_EXPIRES_IN,
cloud_name:process.env.CLOUD_NAME,
cloud_api_key:process.env.CLOUD_API_KEY,
cloud_api_secret:process.env.CLOUD_API_SECRET,
sp_endpoint:process.env.SP_ENDPOINT,
sp_username:process.env.SP_USERNAME,
sp_password:process.env.SP_PASSWORD,
sp_prefix:process.env.SP_PREFIX,
sp_return_url:process.env.SP_RETURN_URL

}