/**
 * jquery.textslider
 * by David Pai <davidpai2000@gmail.com>
 *
 * Copyright (c) 2012 David Pai
 * Version: 1.0
 *
 * Licensed under Creative Commons Attribution-ShareAlike 3.0 Unported License:
 * http://creativecommons.org/licenses/by-sa/3.0/
 *
 * NOTE: This script requires jQuery to work.  Download jQuery at www.jquery.com
 */
;(function($) {
    $.fn.textslider = function(options) {
        // 設定參數
        var _defaultOptions = { direction : 'scrollUp', // 捲動方向: scrollUp向上, scrollDown向下
                                scrollNum : 1, // 一次捲動幾個<li>
                                scrollSpeed : 800, // 捲動速度(ms)
                                pause : 4200  // 停頓時間(ms)
                                };
        var _options = $.extend(_defaultOptions, options);

        var timer;  // 計時器
        var $sliderUl = $(this).children('ul');  // 容器物件裡面的<ul>
        var numLi = $sliderUl.children().length;  // 一開始有幾個<li>項目
        var $sliderLi = $sliderUl.append($sliderUl.html()).children();  // 把<ul>中的內容再重覆加入<ul>中，讓裡面有兩組內容
        var _scrollHeight = $sliderLi.height() * _options.scrollNum;  // 捲動的高度 = 一個<li>的高度 * 一次捲動幾個<li>
        var _pause = _options.pause = _options.pause + _options.scrollSpeed; // 計時器的總時間，應該要再加上捲動的時間
        
        // 捲動方向: scrollUp向上, scrollDown向下
        switch (_options.direction) {
            default:
            case 'scrollUp': 
                _scrollHeight = _scrollHeight * -1;  // 向上捲動，css的top屬性要設成負值
            break;
            
            case 'scrollDown':
                _scrollHeight = _scrollHeight * 1; // 向下捲動，css的top屬性要設成正值
                $sliderUl.css({'top' : numLi * $sliderLi.height() * -1});  // 先把 $sliderUl 的位置往上拉一半，這樣捲下來的時候才會有內容
            break;
        }

        // 滑鼠移入時停止計時器，移開再度啟動
        $sliderUl.hover(function(){
            clearTimeout(timer);
        }, function(){
            timer = setTimeout(startSlide, _pause);
        });
        
        // 控制捲動的函數
        function startSlide() {
            // 計算現在$sliderUl的位置是第幾次的捲動
            var _now = $sliderUl.position().top / _scrollHeight;
            _now = (_now + 1) % ($sliderLi.length / _options.scrollNum);

            // 捲動
            $sliderUl.animate({
                top : _now * _scrollHeight  // 要捲動到下一個<li>的位置
            }, 
            _options.scrollSpeed, // 捲動速度
            function(){  // 捲完後的callback
                switch (_options.direction) {
                    default:
                    case 'scrollUp': 
                        // 如果 $sliderUl 已經捲到第二組，馬上把 top 設 0 回到第一組
                        if(_now == ($sliderLi.length / _options.scrollNum) / 2){
                            $sliderUl.css('top', 0);
                        }
                    break;
                    
                    case 'scrollDown':
                        // 如果 $sliderUl 已經捲動到 top=0 的位置時，馬上再把位置往上拉一半
                        if ( $sliderUl.position().top == 0 ) {
                            $sliderUl.css({'top' : numLi * $sliderLi.height() * -1});
                        }
                    break;
                }
            });
     
            // 再重啟計時器
            timer = setTimeout(startSlide, _pause);
        }
        
        // 啟動計時器
        timer = setTimeout(startSlide, _pause);
    };
})(jQuery);