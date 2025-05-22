import request from "../utils/http/request";

/**
 * 获取用户短信列表数据
 */
export const SmsListService = () => {
  return request.get("/user/sms")
}

/**
 *获取验证码
 */
export const SmsCodeService = () => {
  return request.get(`/user/sms/code`)
}