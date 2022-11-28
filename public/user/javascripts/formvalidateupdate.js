
var nameError = document.getElementById('name-error')
var emailError = document.getElementById('email-error')
var mobileError=document.getElementById('mobile-error')
var PasswordError=document.getElementById('password-error')
var submitError = document.getElementById('btnError')

function validateName(){
    var name = document.getElementById('name').value;

    if(name.length == 0){
        nameError.innerHTML = 'Name required';
        return false;
    }
    if(!name.match(/^[A-Za-z]*\s{1}[A-Za-z]*$/)){
        nameError.innerHTML = 'Write Full Name';
        return false;
    }
    else{
        nameError.innerHTML="";
        return true
    }
    
}

function validateEmail(){
    var email =  document.getElementById('email').value;
    if(email.length==0){
        emailError.innerHTML = 'Email required'
        return false;
    }
    if(!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)){
        emailError.innerHTML = 'Email Invalid'
        return false;
    }
    else{
        emailError.innerHTML="";
        return true
    }
   
}

function validateMobile(){
    var mobile=document.getElementById('mobile').value
    if(mobile.length==0){
        mobileError.innerHTML='Mobile Number Required'
        return false
    }
    if(mobile.length!=10){
        mobileError.innerHTML='Mobile Number should be 10 digit'
        return false
    }

    if(!mobile.match((/^[0-9]{10}$/))){
        mobileError.innerHTML='number invalid'
        return false
    }
    else{
        mobileError.innerHTML=""
        return true
    }
}

function validatePassword(){
    var Password=document.getElementById('password').value;
    if(Password.length==0){
        PasswordError.innerHTML='Password required'
        return false
    }
    if(!Password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)){ //Minimum eight characters, at least one letter and one number:
        PasswordError.innerHTML='Password invalid';
        return false

    }
    else{
        PasswordError.innerHTML="";
        return true
    }

   
}






function validate(){
    validateName() ;
    validateEmail();
    validateMobile();
    validatePassword();
  
  
   

    if(validateName() && validateEmail()&& validatePassword()&& validateMobile()){

        submitError.style.display = 'block';
        submitError.innerHTML = 'Please fix error to submit'
       
        return true;
    }
    else{
        return false;
    }
}