import axios from 'axios'
import { ElMessage } from "element-plus";
import { userTokenStore } from "../store/token";
import router from "../router";
import message from "./message";
const baseURL = 'http://123.51.208.249:8563/api'
const instance = axios.create({
  baseURL,
  timeout: 30000,
})

// 请求拦截器
instance.interceptors.request.use(
  config => {

    //请求前回调
    const tokenStore = userTokenStore();
    if (tokenStore.token){
      config.headers.Token = tokenStore.token;
    }
    return config;
  },
  (err) => {
    ElMessage.error('请求失败')
    return Promise.reject(err)
  }
)
//添加响应拦截器
instance.interceptors.response.use(
  result => {
    //判断业务状态码
    if (result.data.code === 200) {
      //返回数据
      return result.data;
    }
    //提示错误信息
    message.error(result.data.message || '服务异常');
    //异步操作状态转换为失败
    return Promise.reject(result.data);
  },
  err => {
    // 处理HTTP错误状态
    if (err.response) {
      if (err.response.status === 429) {
        message.error('请求过于频繁，请稍后再试');
      } else if (err.response.status === 401) {
        // ElMessage.error('请先登录');
        //清除token
        userTokenStore().removeToken();
        //跳转到登录页面
        router.push('/login')
      } else if (err.response.status === 404) {
        message.error('请求的资源不存在');
      } else if (err.response.status === 500) {
        message.error('服务器内部错误');
      } else {
        message.error(`请求失败(${err.response.status}): ${err.response.data?.message || '未知错误'}`);
      }
    } else if (err.request) {
      // 请求发出但没有收到响应
      message.error('服务器无响应，请检查网络连接');
    } else {
      // 请求配置有误
      message.error('请求配置错误: ' + err.message);
    }
    return Promise.reject(err);//异步的状态转化成失败的状态
  }
)
export default instance;
