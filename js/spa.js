// 定义 Router  
class Router {  
    constructor () {  
        this.routes = {};  
        this.listerPopState()  
    }  
    init(path) {  
        history.replaceState({path: path}, null, path);  
        this.routes[path] && this.routes[path]();  
    }  
    route(path, callback){  
        this.routes[path] = callback;  
    }  
    push(path) {  
        history.pushState({path: path}, null, path);  
        this.routes[path] && this.routes[path]();  
    }  
    listerPopState () {  
        window.addEventListener('popstate' , e => {  
            const path = e.state && e.state.path;  
            this.routers[path] && this.routers[path]()  
        })  
    }  
}  
// 使用 Router  
window.miniRouter = new Router();  
miniRouter.route('/', ()=> console.log('page1'))  
miniRouter.route('/#/index.html', ()=> console.log('page2'))  
// 跳转  
miniRouter.push('/#/index.html')  // page2
