$(function(){
    // Slick Slider = welcome
    
    $('.slideshow').slick({
        dots: false,
        infinite: true,
        speed: 1000,
        autoplay: true,
        autoplaySpeed: 2000,
        fade: true,
        pauseOnHover: false,
        arrows: false,

      });

      // Slick - Review
      $('.review-slider, .mockup-slider').slick({
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
      });
      
      // TypeIt - Welcome 

      $('#typing').typeIt({
        strings: ["A Valuable Asset.", "Safe Remittance.", "Creative Idea."], // 타이핑 텍스트 입력
        speed: 100, // 알파벳 타이핑 속도
        autoStart: true, // 자동 재생 사용
        breakLines: false, // 줄 바꿈 사용안함
      });

      // Wow Scroll
      wow = new WOW(
        {
        boxClass:     'wow',      // default
        offset:       150,          // default
        mobile:       false,       // default
      })
      wow.init();
})

// Faq Accoirdion 쿼리 오류 때문에 위의 코드와 따로 적음
$(function(){
  // header scroll change
  $(window).scroll(function(){
    if($(window).scrollTop() > 50){
      $('header , .btn-top').addClass('active')
    }
    else{
      $('header , .btn-top').removeClass('active')
    }
  })

  // Faq Accordion
  $('.faq-desc').eq(0).show();
  $('.faq-title').click(function(){
    $(this).next().stop().slideDown();
    $(this).parent().siblings().children('.faq-desc').stop().slideUp();
    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active');
  }) 

  // Video modal
  $('.open-modal').click(function(){
    $('.video-modal').fadeIn();
    $('body').addClass('active');
  })
  $('.close-modal').click(function(){
    $('.video-modal').fadeOut();
    $('body').removeClass('active');
  })

  // Header Trigger
  $('.trigger').click(function(){
    $(this).toggleClass('active');
    $('.gnb').toggleClass('active');
  });

  $('.gnb a, section').click(function(){
    $('.gnb , .trigger').removeClass('active');
  })
})
