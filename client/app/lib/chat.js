var emots = {
    hide: true
};

(function ($) {
    $('.emots').hide();
    $('.btn-emots').click(function () {
        if ($('.emots').is(':hidden')) {
            return $('.emots').fadeIn("slow");
        }
        $('.emots').fadeOut("slow")
    });
    $('.aboutAutor').hide();

})(jQuery)