import axios from 'axios'
import { ElMessage } from "element-plus";
import { userTokenStore } from "../../store/token";
import router from "../../router";
import message from "../message";

// 从环境变量中获取API基础URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// 判断是否为生产环境
const isProd = import.meta.env.PROD;
// 是否启用API日志 - 开发环境默认启用，生产环境根据配置
const enableLogs = isProd 
  ? import.meta.env.VITE_ENABLE_API_LOGS === 'true'
  : true;

const instance = axios.create({
  baseURL,
  timeout: 30000,
})

// 创建适配器，用于在生产环境中通过主进程代理发送请求
const electronAdapter = async (config) => {
  // 开发环境直接使用axios默认适配器
  if (!isProd) {
    return axios.defaults.adapter(config);
  }

  try {
    // 从config中提取需要的参数
    const { url, method, data, params, headers } = config;
    
    if (enableLogs) {
      console.log(`[请求] ${method} ${url}`);
      console.log(`[请求数据]`, method.toUpperCase() === 'GET' ? params : data);
    }
    
    // 通过预加载脚本暴露的API发送请求
    const response = await window.electronAPI.apiRequest({
      url: url,
      method,
      // 对于GET请求，使用params作为data传递
      data: method.toUpperCase() === 'GET' ? params : data,
      headers
    });
    
    if (enableLogs) {
      console.log(`[响应]`, response);
    }
    
    if (!response.success) {
      // 请求失败
      return Promise.reject({
        response: {
          status: response.status,
          data: response.data
        },
        message: response.message
      });
    }
    
    // 构造axios响应格式
    return {
      data: response.data,
      status: response.status,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    };
  } catch (error) {
    console.error(`[请求错误]`, error);
    return Promise.reject(error);
  }
};

// 仅在生产环境中设置适配器
if (isProd) {
  instance.defaults.adapter = electronAdapter;
}

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
