$(document).ready(function () {
    $('#register-submit').submit(function(e){
        e.preventDefault();

        axios.put('/sign-up', {
            user: user,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            password: user.password,
        })
            .then((res) => {
                console.log("AXIOS USER", user)
                console.log(res);
            })
            .catch((err) => {
                console.log(err.response)
            })
    })

    $('.form').find('input, textarea').on('keyup blur focus', function (e) {

        var $this = $(this),
            label = $this.prev('label');

            if (e.type === 'keyup') {
                if ($this.val() === '') {
                label.removeClass('active highlight');
            } else {
                label.addClass('active highlight');
            }
        } else if (e.type === 'blur') {
            if( $this.val() === '' ) {
                label.removeClass('active highlight');
                } else {
                label.removeClass('highlight');
                }
        } else if (e.type === 'focus') {

            if( $this.val() === '' ) {
                label.removeClass('highlight');
                }
            else if( $this.val() !== '' ) {
                label.addClass('highlight');
                }
        }

    });

    $('.tab a').on('click', function (e) {

        e.preventDefault();

        $(this).parent().addClass('active');
        $(this).parent().siblings().removeClass('active');

        target = $(this).attr('href');

        $('.tab-content > div').not(target).hide();

        $(target).fadeIn(600);

    });
});
