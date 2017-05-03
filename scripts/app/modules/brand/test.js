define('/modules/brand/test', ['require', 'exports', 'module', '/modules/vue/vue', '/modules/vue/vue-common'],function(require, exports, module) {
var Vue = require('/modules/vue/vue');
var common = require('/modules/vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '品牌馆',
        headerColorSta: false,
        headerCss:{      //标题栏背景
            'background-color':'rgba(255, 255, 255,0)'
        },
        brandFourCate: [],
        categoryfourList: [
            {   imgUrl: "",
                price: ""
            },{ imgUrl: "",
                price: ""
            },{ imgUrl: "",
                price: ""
            },{ imgUrl: "",
                price: ""
            }
        ],
        categoryList: [],
        brandCateImg: "",
        brandList: [],
        pageData: {},
        thisBrand: null,
        init: false,
        isEmpty: false,
        toTop:false,       // 返回顶部
        scrollY:0,
        nowBrand: null,
        nowCate: "",
        pageIndex: 1,       // 默认返回第一页数据
        orderTotal: null,
        currentCate: 0,
        /***/
        brandCategory: [],
        allBrandPrdList: [],
        showPage1: false,
        showPage2: false,
        isNowCate: [],
        swiper: null,
        cateIndex: 1,
        totalBrand: null
    },
    computed: {
        currentBrand: function () {
            var $this = this;
            return {
                ponyef: $this.thisBrand == 1,
                imeme: $this.thisBrand == 2,
                nooni: $this.thisBrand == 3,
                bonvivant: $this.thisBrand == 4
            }
        }
    },
    methods: {
        initScroll: function () {
            var $this = this;
            var timer;
            setTimeout(function(){
                var scrollDom =document.querySelector('#s-brand');
                var scroll = mui('#s-brand').scroll({
                    indicators: false //是否显示滚动条
                });
                scrollDom.addEventListener('scroll',function () {
                    timer = setTimeout(function(){
                        $this.scrollY = scroll.y;
                        clearTimeout(timer);
                    },50)
                })
            },0);
        },
        initMui: function (){
            var $this = this;
            mui.init({
                pullRefresh: {
                    container: '#brandlist',
                    up: {
                        contentrefresh: '正在加载...',
                        contentnomore: '没有更多数据了',   //没有更多数据了
                        callback: pullupRefresh
                    }
                }
            });
            function pullupRefresh() {
                setTimeout(function () {
                    mui('#brandlist').pullRefresh().endPullupToRefresh();

                    if ((10 * $this.pageIndex) >= $this.orderTotal) {
                        $this.popup({
                            content: '没有更多商品了', time: 1000, autoClose: true
                        });
                        mui('#brandlist').pullRefresh().endPullupToRefresh(true);
                    }else {
                        $this.pageIndex++;
                        $this.getBrandPrdList(function (data) {
                            $this.brandList = ($this.brandList).concat(data['data']);
                        })
                    }
                }, 0);
            }
        },
        getBrandId: function (name) {
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null)return (r[2]);
            return null;
        },
        getBrandData: function (brandId) {
            var $this = this;
            $this.pageData = {};
            $this.httpAjax({
                url: '/mobilev44/brand/center',
                success: function (data) {
                    if(data.code == 1){
                        var sourceData = data.data;
                        for(var i=0; i<sourceData.length; i++){
                            if(sourceData[i].brandId == brandId){
                                $this.pageData = sourceData[i];
                            }
                        }

                    }else{
                        $this.popup({content: data.msg});
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
            return $this.pageData;
        },
        getBrandList: function (callback) {
            var $this = this,
                param = {
                    pageIndex: $this.pageIndex,
                    brand: $this.nowBrand
                };
            $this.isEmpty = false;
            $this.httpAjax({
                url:  '/global/search',
                domain: $this.searchDomain,
                param: param,
                success: function (data) {
                    $this.orderTotal=data.orderTotal;
                    if(callback){
                        callback(data);
                    }else{
                        if(data.code == 1 && data.orderTotal != 0){
                            $this.brandList = data.data;
                        }else{
                            $this.isEmpty = true;
                            $this.brandList = [];
                        }
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
        },
        getBrandPrdList: function (callback) {
            var $this = this;
            $this.isEmpty = false;
            $this.httpAjax({
                url:  '/global/search',
                domain: $this.searchDomain,
                param: {
                    cateIndex: $this.cateIndex,
                    brand: "PONY",
                    category: ""
                },
                success: function (data) {
                    $this.orderTotal=data.orderTotal;
                    if(callback){
                        callback(data);
                    }else{
                        if(data.code == 1 && data.orderTotal != 0){
                            $this.allBrandPrdList = data.data;
                        }else{
                            $this.isEmpty = true;
                            $this.allBrandPrdList = [];
                        }
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
            mui('#brandlist').scroll();
        },
        changeTab: function (event) {
            var $this = this,
                val = event.target.getAttribute("value"),
                parentClass = event.target.parentNode.className,
                brandId = $this.getBrandId("id");
            if(parentClass == "active"){
                return false;
            }else{
                document.querySelector(".brand-topNav .active").className = "";
                event.target.parentNode.className = "active";
                if(val == "首页"){
                    $this.headerColorSta = false;
                    $this.headerCss = {'background-color':'rgba(255, 255, 255, 0)'};
                    $this.showPage1 = true;
                    $this.showPage2 = false;
                }else if(val == "全部商品"){
                    $this.headerColorSta = true;
                    $this.headerCss = {'background-color':'rgba(255, 255, 255, 1)'};
                    $this.showPage1 = false;
                    $this.showPage2 = true;
                    setTimeout(function () {
                        $this.swiper = new Swiper('.brandlist-container .swiper-container', {
                            slidesPerView: 3,
                            paginationClickable: true,
                            spaceBetween: 10,
                            freeMode: true,
                            resistanceRatio: 0,
                            //initialSlide: $this.currentCate
                        });
                    }, 10);
                    $this.isNowCate[0] = true;
                    $this.getBrandPrdList();
                }else{
                    $this.headerColorSta = false;
                    $this.headerCss = {'background-color':'rgba(255, 255, 255, 0)'};
                    location.href=val;
                }
            }
        },
        changeCate: function (brand, cate, event) {
            var $this = this,
                brand = brand ? brand:"PONY EFFECT",
                category = cate ? cate:"",
                clickItem = event.target.parentNode.className.split(" "),
                nowIndex = event.target.parentNode.getAttribute("value"),
                isActive = _.indexOf(clickItem, "active");

            $this.isNowCate = [];
            if(isActive == -1){
                $this.isNowCate[nowIndex] = true;
                $this.getBrandPrdList();
            }else{
                return false;
            }
        },
        checkAllBrand: function () {
            var $this = this,
                brandId = $this.getBrandId("id");
            $this.currentCate++;
            location.href='../brand/brandlist.html?id='+brandId+'&index='+$this.currentCate;
        },
        goToPage: function (productId) {
            var $this = this;
            location.href = location.origin + $this.page + '/productDetails/productDetails.html#'+productId;
        }
    },
    watch:{
        scrollY:function(val, oldVal){
            var $this = this;
            var windowH = document.body.clientHeight;
            var scrollH = windowH * 0.4;
            var opacityBg = 0;
            var scrollY = val;
            if(scrollY >= 0){
                opacityBg = 0;
            }else if(scrollY <0 && scrollY>=-(scrollH)){
                opacityBg = (-scrollY/scrollH).toFixed(2);
            }else{
                opacityBg = 1;
            }
            if(scrollY >= 0){
                $this.headerColorSta = false;
            }else{
                $this.headerColorSta = true;
            }
            $this.headerCss = {'background-color':'rgba(255, 255, 255,'+opacityBg+')'};     //标题栏背景*/
        }
    },
    ready: function () {
    },
    created: function () {
        var $this=this;
        $this.initMui();
        $this.getBrandPrdList();
    }
});
});