/**
 * @summary     Audio Equalizer
 * @description Equalizer Animation for Audio Using Frequency Data
 * @version     1.0
 * @file        jquery.equalizer.js
 * @authors      Ali Nawaz (ali.nawaz@cooperativecomputing.com), Nicholas Woodward (nic@symbios.wiki)
 * @contact     www.cooperativecomputing.com, www.symbios.wiki
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 * 
 * For details please refer to: www.cooperativecomputing.com
 */

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

(function( $ ){
    $.fn.equalizer = function(options) {
        var music = true;  // enable / disable music
        var color_degrading_degree = -7;   // must be an integer
        var thisAudio = $(this).attr('id');
        var equalizer = $("."+thisAudio+".equalizer");
        var equiFunction = function(frequencyData){};

            if (typeof options === 'object' && 'equiFunction' in options) {
                equiFunction = options.equiFunction;
            } 
            
            if (typeof options === 'object' && 'width' in options && options.width > 0) {
                var width = options.width;
            } else {
                var width = 600;
            }

            if (typeof options === 'object' && 'height' in options && options.height > 0) {
                var height = options.height;
            } else {
                var height = 100;
            }

            if (typeof options === 'object' && 'color' in options && options.color != '') {
                var base_color = options.color;
            } else {
                var base_color = '#EEEEEE';
            }

            if (typeof options === 'object' && 'color1' in options && options.color1 != '' && 'color2' in options && options.color2 != '') {
                var first_color_red      = hexToRgb(options.color1).r;
                var first_color_green    = hexToRgb(options.color1).g;
                var first_color_blue     = hexToRgb(options.color1).b;
                var second_color_red     = hexToRgb(options.color2).r;
                var second_color_green   = hexToRgb(options.color2).g;
                var second_color_blue    = hexToRgb(options.color2).b;
                var color_degrading_mode = "double";
            } else {
                var first_color_red      = 184;
                var first_color_green    = 55;
                var first_color_blue     = 242;
                var second_color_red     = 0;
                var second_color_green   = 154;
                var second_color_blue    = 217;
                var color_degrading_mode = "single";
            }

            if (typeof options === 'object' && 'bars' in options && options.bars > 0) {
                var n_bars = options.bars;
            } else {
                var n_bars = 20;
            }

            if (typeof options === 'object' && 'components' in options && options.components > 0) {
                var n_components_per_bar = options.components;
            } else {
                var n_components_per_bar = 8;
            }

            if (typeof options === 'object' && 'barMargin' in options && options.barMargin > 0) {
                var bar_margin = options.barMargin;
            } else {
                var bar_margin = 1;
            }

            if (typeof options === 'object' && 'componentMargin' in options && options.componentMargin > 0) {
                var bar_component_margin = options.componentMargin;
            } else {
                var bar_component_margin = 1;
            }

            if (typeof options === 'object' && 'frequency' in options && options.frequency > 0 && options.frequency <= 20) {
                var frequency = options.frequency;
            } else {
                var frequency = 9;
            }

            if (typeof options === 'object' && 'refreshTime' in options && options.refreshTime > 0) {
                var refresh_time = options.refreshTime;
            } else {
                var refresh_time = 100;
            }

        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var audioElement = document.getElementById('audioPlayer');
        var audioSrc = audioCtx.createMediaElementSource(audioElement);
        var analyser = audioCtx.createAnalyser();

        var frequencyData = new Uint8Array(n_bars);

        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 1024;

        audioSrc.connect(analyser);
        audioSrc.connect(audioCtx.destination);
    
    // var width = equalizer.width();
    // var height = equalizer.height();
    var bar_width            = (width / n_bars) - bar_margin*2;
    var bar_component_height = (height / n_components_per_bar) - 2 * bar_component_margin;
    var realHeightMargin = bar_component_margin * 100.0 / bar_component_height;

    var red_degrading_degree   = 0;
    var blue_degrading_degree  = 0;
    var green_degrading_degree = 0;
    
    for (var i=0;i<n_bars;i++) {
        equalizer.append("<div class='equalizer_bar equalizer_bar_"+thisAudio+"'></div>");
    }
    
    var i = 0;
    $(".equalizer_bar_"+thisAudio).each(function(index) {
        for (var j=0;j<n_components_per_bar;j++) {
            $(this).append("<div class='equalizer_bar_component equalizer_bar_component_"+thisAudio+"' id='"+thisAudio+"_bar_"+i+"_component_"+j+"'></div>");
        }
          
        $(".equalizer_bar_component_"+thisAudio,this).reverseOrder();
        i++;
    });

    if (color_degrading_mode == "double") {
       red_degrading_degree   = (second_color_red - first_color_red)/n_components_per_bar;
       green_degrading_degree = (second_color_green - first_color_green)/n_components_per_bar;
       blue_degrading_degree  = (second_color_blue - first_color_blue)/n_components_per_bar;
    }

    function apply_colors()
    {
        var i = 0;
        $(".equalizer_bar_"+thisAudio).each(function(index) {
            for ( var j=0;j<n_components_per_bar;j++) {         
                $("#"+thisAudio+"_bar_"+i+"_component_"+j).css("backgroundColor",base_color);
            }
            i++;
        });
    }

    apply_colors();
    
    $(".equalizer_bar_"+thisAudio).css("width",bar_width+"%");
    $(".equalizer_bar_"+thisAudio).css("height","100%");
    $(".equalizer_bar_"+thisAudio).css("margin","0% " + bar_margin +"%");
    $(".equalizer_bar_component_"+thisAudio).css("height",bar_component_height+"%");
    //$(".equalizer_bar_component_"+thisAudio).css("margin", realHeightMargin+"% 0%");

    function activate_equalizer()
    {
        if (music == true && $("#"+thisAudio).get(0).paused == false) {
            analyser.getByteFrequencyData(frequencyData);
            equiFunction(frequencyData);
            /*
            for(var i = 0; i < n_bars; i++){
                var val = frequencyData[i] / 255.0;
                var j = Math.round((val*n_components_per_bar));
                for(var k = j; k < n_components_per_bar; k++){
                    $("#" + thisAudio + "_bar_" + i + "_component_" + k).css("backgroundColor", "transparent");
                }
                for(var k = 0; k < j; k++){
                    $("#" + thisAudio + "_bar_" + i + "_component_" + k).css("backgroundColor", base_color);
                }
            }
            */
        } 
        /*
        else{
            for(var i = 0; i < n_bars; i++){
                for(var k = 0; k < n_components_per_bar; k++){
                    $("#" + thisAudio + "_bar_" + i + "_component_" + k).css("backgroundColor", "transparent");
                }
            }
        }
        */
    }

    setInterval(activate_equalizer, refresh_time);

    };
})( jQuery );
