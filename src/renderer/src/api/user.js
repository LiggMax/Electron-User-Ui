import request from "../utils/request";

/**
 * 登录
 */
export const UserLoginService = (loginData) => {
  return request.post("/users/login", loginData)
}
