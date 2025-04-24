import request from "../utils/request";

/**
 * 登录
 */
export const UserLoginService = (loginData) => {
  return request.post("/user/account/login", loginData)
}

/**
 * 获取用户信息
 */
export const UserInfoService = () => {
  return request.get("/user/info")
}

/**
 * 更新用户信息
 */
export const UserUpdateService = (userData) => {
  return request.put("/user/update", userData)
}
