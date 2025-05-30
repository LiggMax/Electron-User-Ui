import request from "../utils/http/request";

/**
 * 登录
 */
export const UserLoginService = (loginData) => {
  return request.post("/user/account/login", loginData)
}
/**
 * 注册
 */
export const UserRegisterService = (registerData) => {
  return request.post("/user/account/register", registerData)
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

/**
 * 项目收藏
 */
export const ProjectCollectService = (projectId) => {
  return request.post("/user/favorite", {
    projectId
  })
}

/**
 * 号码购买
 */
export const PhoneBuyService = (phoneData) => {
  return request.post("/user/buy", phoneData)
}

/**
 * 上传头像
 */
export const UserAvatarService = (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  
  return request.post("/user/uploadAvatar", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
/**
 * 获取用户收藏的项目
 */
export const UserFavoriteService = () => {
  return request.get("/user/favorite")
}

/**
 * 获取用户订单
 */
export const UserOrderService = () => {
  return request.get("/user/order")
}

/**
 * 账号注销
 */
export const UserLogoutService = () => {
  return request.delete("/user/logoutAccount")
}
