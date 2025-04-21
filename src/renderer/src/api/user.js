import request from "../utils/request";

/**
 * 登录
 */
export const UserLoginService = (loginData) => {
  return request.post("/users/login", loginData)
}

/**
 * 获取用户信息
 */
export const UserInfoService = () => {
  return request.get("/users/userInfo")
}
