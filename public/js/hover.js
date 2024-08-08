$( document ).ready(function() {
  $(".usernamesi").focus(function(){
    $(".usernamesi-help").slideDown(500);
  }).blur(function(){
    $(".usernamesi-help").slideUp(500);
  });

  $(".passwordsi").focus(function(){
    $(".passwordsi-help").slideDown(500);
  }).blur(function(){
    $(".passwordsi-help").slideUp(500);
  });

  $(".usernamesu").focus(function(){
    $(".usernamesu-help").slideDown(500);
  }).blur(function(){
    $(".usernamesu-help").slideUp(500);
  });

  $(".passwordsu").focus(function(){
    $(".passwordsu-help").slideDown(500);
  }).blur(function(){
    $(".passwordsu-help").slideUp(500);
  });
});