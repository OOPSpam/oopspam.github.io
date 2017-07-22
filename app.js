var btscan = $('#btscan');
var input = $(".textarea");


// input.on('keyup',function(e){
//     console.log(input.val());
//      if (input.val() != null && input.val().trim() != "") {
//         $('#txExample .hljs-string').text(input.val());
//      }else{
//         $('#txExample .hljs-string').text('The example content!');
//      }
// });

$(".delete").live("click",function(){
 var notify = $(".notification.is-info")
 notify.css("visibility","hidden");
 notify.text("");

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
            data: JSON.stringify({ text: inputValue }),
            contentType: 'application/json',
            success: function (data) {
                btscan.removeClass('is-loading');
                // var dataparsed=  JSON.parse(data);
                console.log(data);
                // showing the response
                var showResult = $(".notification.is-info");
                
                showResult.text("");
                showResult.text(data['spam'] + " out of 3 recognized the content as spam");
                showResult.append("<button class='delete'></button>");
                showResult.css("visibility","visible")
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
