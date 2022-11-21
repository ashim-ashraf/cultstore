exports.userSignupValidator = (req,res,next) => {

    console.log(req.body);
    req.check('name', 'Invalid Name')
        .notEmpty()
        .matches(/[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/)
        

    req.check('email','Invalid Email')
        .matches(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)
        
    req.check('phone','Invalid Phone Number')
        .notEmpty()
        .matches(/^[0-9]{10}$/)

    const errors = req.validationErrors()

    if (errors){
        const firstError = encodeURIComponent(errors.map(error => error.msg)[0])
        return res.redirect('/signUp?valid='+firstError)
    }     

    next();
    
};

