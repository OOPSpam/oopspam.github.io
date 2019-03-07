var btscan = $('#btscan');
var input = $(".textarea");


// $(".delete").live("click",function(){
//  var notify = $(".notification.is-info")
//  notify.css("display","none");
//  notify.text("");

// });
document.addEventListener('DOMContentLoaded', () => {
  (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
    $notification = $delete.parentNode;
    $delete.addEventListener('click', () => {
      $notification.parentNode.removeChild($notification);
    });
  });
});

btscan.on('click', function () {
    // post a JSON payload:
    let inputValue = input.val();
    let notify =  $(".notification");
    console.log(inputValue);
    if (inputValue != null && inputValue.trim() != "") {
        btscan.addClass('is-loading');
        $.ajax({
            type: 'POST',
            url: 'https://oopspam.herokuapp.com/',
            // post payload:
            data: JSON.stringify({ text: inputValue.trim() }),
            contentType: 'application/json',
            success: function (data) {
                btscan.removeClass('is-loading');
                console.log(data);
                // showing the response
                var showResult = $(".notification.is-info");
                
                showResult.text("");
                showResult.text(data['spam'] + " out of 3 recognized the content as spam");
                showResult.append("<button class='delete'></button>");
                showResult.css("display","block")
                showResult.addClass("animated pulse");
                showResult.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                showResult.removeClass('animated pulse');
                
                });

            },
            error: function (xhr, type) {
                btscan.removeClass('is-loading');
                console.log('error');
            }
        });
        
    }else{
        input.addClass('animated pulse');
        input.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            input.removeClass('animated pulse');
        });

    }
});
