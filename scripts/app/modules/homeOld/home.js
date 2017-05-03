define('/modules/homeOld/home', ['require', 'exports', 'module', '/modules/vue/vue', '/modules/vue/vue-validator', '/modules/vue/vue-common'],function(require, exports, module) {
/**
 * Created by Jesse on 16/4/21.
 */


var Vue = require('/modules/vue/vue');
Vue.use(require('/modules/vue/vue-validator'));
var common = require('/modules/vue/vue-common');
var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '全球No.1韩国化妆品平台  - 美美箱Memebox',
        init: false,
        dataMenu: {},
        dataFlash: {},                   //抢购
        dd: null,
        hh: null,
        mm: null,
        ss: null,
        dataBanner: null,
        dataProductList: {},
        dataTopic: null,
        dataBottom: {},
        dataLayer: null,
        homeProductList: {},
        isHomepage: '',                 //首页的标志, '1'代表首页, '0'代表频道页
        bottomFix: false,                //底部浮层
        hash: '',                       //url->hash
        categoryId: '',                 //产品分类类别
        showList: '1',                  //频道页的商品列表
        cartNumber: '',                 //购物车数量
        classify: '/m/productClassify/productClassify.html#',
        details: '/m/productDetails/productDetails.html#',
        price: null,
        position: true,
        pageIndex: 1,
        orderTotal:'',
        dMask:null,
        dcd:5,
    },
    methods: {
        initMui: function () {
            var $this = this;
            //循环初始化所有下拉刷新，上拉加载。
            mui.init({
                pullRefresh: {
                    container: '#pullrefresh',
                    up: {
                        contentrefresh: '正在加载...',
                        contentnomore: '没有更多数据了',
                        callback: pullupRefresh
                    }
                }
            });
            /**
             * 上拉加载具体业务实现
             */
            function pullupRefresh() {
                setTimeout(function () {
                    var length = $this.dataProductList.data.length;
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh((Number(length) == Number($this.dataProductList.total)));
                    if (Number(length) == $this.orderTotal){
                        $this.popup({
                            content: '没有更多商品了', time: 1000, autoClose: true
                        });
                        mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                    } else {
                        $this.pageIndex++;
                        $this.getList({}, function (data) {
                            $this.dataProductList.data = $this.dataProductList.data.concat(data.data);
                        });
                    }
                }, 0);
            }
        },
        showHomepage: function (event) {
            window.event.returnValue = false;
            var index = event.target.getAttribute('index');
            var moveWidth = document.querySelector('.mui-control-item.mui-active').offsetWidth;
            mui('#sliderSegmentedControl').scroll().scrollTo(-moveWidth * index, 0, 200);
            var $this = this;
            $this.first = true;
            $this.hash = event.target.hash;
            $this.categoryId = $this.hash.slice(1);
            location.hash = '';
            if (!$this.dataBanner) {
                $this.isHomepage = '';
                $this.initHome();
            } else {
                $this.isHomepage = '1';
            }
        },
        menuMethod: function (event) {
            var index = event.target.getAttribute('index');
            var moveWidth = document.querySelector('.mui-control-item.mui-active').offsetWidth;
            mui('#sliderSegmentedControl').scroll().scrollTo(-moveWidth * index, 0, 200);
            //频道页
            mui('#pullrefresh').pullRefresh().refresh(true);
            window.event.returnValue = false;
            var $this = this;
            $this.hash = event.target.hash;
            $this.categoryId = $this.hash.slice(1);
            $this.showList = '0';
            $this.isHomepage = '2';
            location.hash = event.target.hash;
            mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100);
            this.$refs.loading.show = true;
            $this.positionSort(true);
            $this.price = null;
            $this.pageIndex = 1;
            $this.position = true;
        },
        closeBottom: function (event) {
            event.preventDefault();
            this.bottomFix = false;
        },

        initCart: function (showLoading) {
            var $this = this;
            // setTimeout(function () {
            $this.httpAjax({
                url: '/h5/newcart/count',
                showLoading: showLoading,
                success: function (data) {
                    $this.cartNumber = data['data']['totalQty'];
                }
            });
            // }, 200)
        },
        //获得列表
        getList: function (param, callBack) {
            var $this = this;
            param = param || {};
            param.pageIndex = $this.pageIndex;
            param.categoryId = $this.categoryId;
            param.order = 1;
            if($this.price){
                $this.price == 'asc'?param.order='3':param.order='4';
            }
            $this.httpAjax({
                url: '/global/search',
                domain: $this.searchDomain,
                param:param,
                success: function (data) {
                    $this.orderTotal = data.orderTotal;
                    if (data['total'] == '0') {
                        $this.$refs.loading.show = false;
                        $this.popup({
                            content: '已被抢空', time: 1000, autoClose: true, ok: function () {
                                window.location.href = $this.page + '/home/home.html';
                            }
                        });
                        return false;
                    }
                    if (callBack) {
                        callBack(data);
                    } else {
                        $this.dataProductList = data;
                    }
                    $this.init = true;
                    $this.$nextTick(function () {
                        $this.initMui();
                    });
                    setTimeout(function () {
                        $this.initEcho()
                    }, 10);
                }
            });
        },
        //价格排序
        priceSort:function () {
            var $this = this;
            var param = {};
            $this.pageIndex = 1;
            $this.price = $this.price=='asc'?'desc':'asc';
            $this.position = false;
            mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
            mui('#pullrefresh').pullRefresh().refresh(true);
            $this.getList(param);
        },
        //综合排序
        positionSort:function (title) {
            var $this = this;
            $this.position = true;
            $this.price = null;
            $this.pageIndex = 1;
            $this.getList({}, function (data) {
                $this.init = true;
                $this.dataProductList = data;
                $this.isHomepage = '0';
                $this.showList = '1';
                $this.initMui();
                title?$this.setTitle(data.categoryName):'';
                setTimeout(function () {
                    $this.initEcho()
                }, 10);
            });
        },
        initHome: function () {
            var $this = this;
            $this.hash = location.hash;
            //setIn
            //menu  菜单
            //刷新页面
            if ($this.hash != '') {
                $this.categoryId = $this.hash.slice(1);
                //频道页
                $this.httpAjax({
                        url: '/h5/view/menu',
                        forCache: true,
                        success: function (data) {
                            $this.dataMenu = data.data;
                            $this.positionSort(true);
                            $this.initCart(true);
                        }
                    }
                );
            } else {
                $this.httpAjax({
                        url: '/h5/view/index',
                        token:false,
                        forCache: true,
                        success: function (data) {
                            $this.dataBanner = data.data.banner;
                            $this.dataLayer = data.data.layerImgUrl;
                            $this.dataBottom = data.data.bottomImgUrl;
                            $this.homeProductList = data.data.homeProductList;
                            $this.dataMenu = data.data.menu;
                            $this.dataTopic = data.data.topicBanner.data;
                            $this.isHomepage = '1';
                            // setTimeout(function () {
                            //     $this.initSwipe();
                            //     $this.initEcho();
                            // }, 10);
                            setTimeout(function () {
                                $this.bottomFix = true;
                            }, 500);
                            // setTimeout(function () {
                            //     //$this.isImgLoad(function(){
                            //
                            //     // 加载完成
                            //
                            //     setTimeout(function () {
                            //         // var mySwiper = new Swiper('.swiper-container', {
                            //         //     loop: true,
                            //         //     autoplay: 2000,
                            //         //     pagination: '.swiper-pagination',
                            //         //     autoplayDisableOnInteraction: false
                            //         // })
                            //         $this.initSwipe();
                            //         $this.initEcho()
                            //     }, 10);
                            //
                            //
                            //     // });
                            //     // 判断图片加载状况，加载完成后回调
                            //     //     $this.isImgLoad(function(){
                            //     //         $this.$refs.loading.show = false;
                            //     //     })
                            // }, 20);

                            $this.httpAjax({
                                url: '/h5/view/flash',
                                success: function (data) {
                                    $this.dataFlash = data;
                                    $this.init = true;
                                    $this.initCart(true);
                                    setTimeout(function () {
                                        $this.initSwipe();
                                        $this.initEcho();
                                    }, 10);
                                    if ($this.dataFlash.data.time_left >= 0) {
                                        var ts = $this.dataFlash.data.time_left;
                                        $this.timer(ts);
                                        var i = setInterval(function () {
                                            if (ts > 0) {
                                                $this.timer(ts);
                                                ts--;
                                            } else {
                                                clearInterval(i);
                                            }
                                        }, 1000);
                                    }
                                }
                            });
                        }
                    }
                );
            }
            $this.initMui();
        },

        //时间转换
        timer: function (ts) {
            var $this = this;
            var dd = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
            var hh = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
            var mm = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
            var ss = parseInt(ts % 60, 10);//计算剩余的秒数
            $this.dd = $this.checkTime(dd);
            $this.hh = $this.checkTime(hh);
            $this.mm = $this.checkTime(mm);
            $this.ss = $this.checkTime(ss);
        },
        checkTime: function (i) {
            i += "";
            if (i < 10) {
                i = ["0", i];
            } else {
                i = [i.slice(0, 1), i.slice(1, 2)];
            }
            return i;
        },
        bannerHref: function (type, id) {
            var href = {
                '0': '/m/productClassify/productClassify.html#' + id,
                '1': '/m/productDetails/productDetails.html#' + id,
                '3': id
            };
            return href[type];
        },
        hideDMask: function (event) {
            this.dMask=1;
            localStorage.dMask=1;

        },
        downloadApp: function () {
            _maq.push(["_trackEvent" , "popup_click_h5" , {}]);
            this.getAppUrl();
        }
    },
    ready: function () {
        // var index=document.querySelector('.mui-control-item.mui-active').getAttribute('index');
        // var moveWidth = document.querySelector('.mui-control-item.mui-active').offsetWidth;
        // moveWidth=-Number(moveWidth)*Number(index);
        // mui('#sliderSegmentedControl').scroll().scrollTo(moveWidth, 0, 200);
        // $this.init=true;
        var $this = this;
        $this.hash = location.hash;
        if ($this.hash == '') {
            _hmt.push(['_trackEvent', 'main_page', '进入首页']);
        }
    },
    created: function () {
        var $this = this;
        $this.dMask=sessionStorage.dMask || localStorage.dMask;
        sessionStorage.dMask=1;
        var ds=setInterval(function () {
            $this.dcd--;
            if($this.dcd<=0){
                clearInterval(ds);
                $this.dMask=1;
            }
        },1000)

        $this.initHome();
        if($this.getSearch('d')==1){
            setTimeout(function () {
                $this.getAppUrl()
            },1000)
        }
        $this.isFanliApp();

    }
});

});