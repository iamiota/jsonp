
/**
 * 用法:
 * import JSONP from 'jsonp';
 * 
 * JSONP.http(data)
 *  .then((res) => {
 *      console.log('success');
 *  },(res) => {
 *      console.log('fail');
 *  })
 *  author: Junquan Yi
 */
class JSONP {
  constructor(num = 0) {
      this.num = num;
  }

  /**
   * 主要方法
   * url不可缺省
   * data为要传的数据,传Object类型即可
   * callback默认随机生成,可以手动填写,但是同一个页面callback不能重复
   * num为自用的递增数字,防止同时发起多个JSONP请求时,名称一致
   */
  http({
    url = undefined,
    data = undefined,
    callback = undefined
    } = {}) {
    this.num++;
    let obj = new JSONP(this.num);
    obj.url = url;
    obj.data = data;
    obj.callback = callback;
    return obj.init()
      .then(obj.registerFun.bind(obj));
  }

  /**
   * 处理Data
   */
    init() {
      let promise = new Promise((resolve, reject) => {
        if (typeof this.url !== 'string') {
          console.warn('请输入正确的URL');
          resolve({
            error: '请输入正确的URL'
          });
          return false;
        }
        this.data = this.data !== null && this.data !== undefined ? JSON.stringify(this.data) : '';
        resolve(this.callback);
      });

      return promise;
    }

  /**
   * 处理Url,
   * 追加callback,data,时间戳
   */
  machiningUrl(url, data, callback) {
    let res = '';
    return `${url}?callback=${callback}&${data}&_=${new Date().getTime()}`;
  }

  /**
   * 注册回调函数
   */
  registerFun(callbackFuncName) {
    let name = callbackFuncName,
      promise = new Promise((resolve, reject) => {
        if (name !== undefined) {
          if (window[name] !== undefined) {
            console.warn('callback已经存在，请重新命名');
            return false;
          }
        } else {
          name = this.getUniqueName();
        }

        window[name] = (res)=> {
          resolve(res);
          /**
           * 阅后即焚
           * 清除内存
           */
          document.body.removeChild(document.querySelector(`#${name}`));
          window[name] = null;
        }

        /**
         * 如果加载出现404直接调用reject
         */
        this.createDom(name, reject);
      });

    return promise;
  }

  /**
   * 获得独一无二的函数名
   */
  getUniqueName() {
    this.num++;
    let name = `i${new Date().getTime()}${this.num}`;
    if (window[name] !== undefined) {
      /**
       * 如果走到这里, 再次获取函数名
       */
      console.warn('callback已经存在');
      return this.getUniqueName();
    }

    return name;
  }

  /**
   * 创建dom
   */
  createDom(callbackFuncName, fail) {
    let _dom = document.createElement('script');
    _dom.src = this.machiningUrl(this.url, this.data, callbackFuncName);
    _dom.id = callbackFuncName;
    document.body.appendChild(_dom);
    _dom.onerror = (res) => {
      if (fail) {
        fail();
      }
    }
  }

}

module.exports = new JSONP();
