$(document).ready(function() {
  loadMessage();
});

function loadMessage(isShowMessage) {
  $("#preloader").show();

  $.ajax({
    url: "https://wedding-api-viethuong.onrender.com/api/message",
    type: "GET",
    tryCount : 0,
    retryLimit : 5,
    error: function(error) {
      this.tryCount++;

      if (this.tryCount <= this.retryLimit) {
          $.ajax(this);

          return;
      }   

      console.log("[ERROR]: ", error);
    },
    success: function(json) {
      $("#wish-box").empty();

      const { status_code } = json;

      if (status_code === 200) {
        const { data } = json;

        const html = renderListMessage(data);

        $("#wish-box").html(html);
        $("#wish-box").scrollTop(0);

        $("#preloader").hide();

        if (isShowMessage) {
          $("#alertError").text("");
          $("#alertError").hide();
          $("#alertSuccess").text("");
          $("#alertSuccess").hide();

          $("#alertSuccess").text("Bạn đã gửi lời chúc thành công!");
          $("#alertSuccess").slideDown("slow");
          setTimeout(function () {
              $("#alertSuccess").slideUp("slow");
          }, 5000);
        }
      } else {
        this.tryCount++;

        if (this.tryCount <= this.retryLimit) {
          $.ajax(this);

          return;
        } 
      }
    }
  });
}

function renderListMessage(arr = []) {
  arr = arr.reverse();
  const lenMessage = arr.length;
  let idxMessage = 0;

  if (lenMessage === 0) {
    return (`
      <div>
        <p style="text-align: center;">Hiện chưa có lời chúc</p>
      </div>
    `);
  }

  const html = [];

  while (idxMessage < lenMessage) {
    const itemMessage = arr[idxMessage];
    const { fullname, message } = itemMessage;

    const htmlMessage = (`
      <div class="wish-box-item">
        <strong>${fullname}</strong>
        <p>${message}</p>
      </div>
    `);

    html.push(htmlMessage);

    idxMessage++;
  }

  return html.join("");
}

$("#btnSendWish").on({
  click: function() {
    handleSendMessage();
  }
});

function handleSendMessage() {
  try {

    if ($("#wish-form").length) {
      $("#preloader").css("display", "inline-block");

      const form = $("#wish-form");
      const inputName = $(form).find("input[name='name']");
      const inputContent = $(form).find("textarea[name='content']");

      const name = inputName.val();
      const content = inputContent.val();

      $.ajax({
          type: "POST",
          url: "https://wedding-api-viethuong.onrender.com/api/message",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify({
            fullname: name,
            message: content
          }),
          success: function (json) {
              const { status_code } = json;
              
              if (status_code === 200) {
                loadMessage(1);

                form.reset();
              } else {
                $("#alertError").text("");
                $("#alertError").hide();
                $("#alertSuccess").text("");
                $("#alertSuccess").hide();

                $("#preloader").hide();

                const { message } = json;
                $("#alertError").text(message);
                $("#alertError").slideDown("slow");
                setTimeout(function () {
                    $("#alertError").slideUp("slow");
                }, 5000);
              }
          },
          error: function () {
            $("#preloader").hide();

            $("#alertError").text("Gửi lời chúc thất bại. Vui lòng thử lại");
            $("#alertError").slideDown("slow");
            setTimeout(function () {
                $("#alertError").slideUp("slow");
            }, 5000);
          }
      });
    }
  } catch (error) {
    console.log(error);
  }
}