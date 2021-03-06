const express  = require('express');
const AuthRouter = express.Router();
const bcrypt = require('bcryptjs');
const userModel = require('../models/users');
const jwt = require('jsonwebtoken');

const jwtSecret = "qweqweqweqwe"

//Authentication
//login
AuthRouter.post('/login', (req, res) =>{
    const {username, password} = req.body;
    if (!username || !password){
        res.json({
            success: 0 ,
            message: 'thiếu username hoặc password'
        })
    }
    userModel.findOne({ username })
    .then(userFound =>{
        if (!userFound || !userFound._id){
            res.json({
                success: 0,
                message: 'Không tồn tại người dùng!'
            })
            } else{
                if(userFound.disabled === true){
                    res.json({
                        success: 0,
                        message: 'Tài khoản của bạn đã bị khóa. Xin vui lòng liên hệ với quản trị viên để tìm hiểu nguyên nhân.'
                    })
                }
                else{
                    if(bcrypt.compareSync(password,userFound.password)){
                        //login with jwt
                        const access_token = jwt.sign({ username, id: userFound._id }, jwtSecret);
    
                        res.json({
                            success: 1,
                            message: 'Đăng nhập thành công!',
                            access_token,
                            user:{
                                username,
                                id: userFound._id
                            }
                        })
                    } else{
                        res.json({
                            success: 0,
                            message: 'Sai mật khẩu!'
                        })
                    }
                }
            }
    }).catch(err => {
        res.json({
            success: 0,
            message: 'Đã có lỗi xảy ra!'
        })
    })
})

AuthRouter.get('/check', (req, res) =>{
    const access_token = req.query.access_token;
    const decode = jwt.verify(access_token, jwtSecret);
    console.log(decode);
    try{
        if(decode && decode.id){
            userModel.find({_id: decode.id})
                .then(userfindDisabled =>{
                    if(userfindDisabled[0].disabled === false){
                        res.send({
                            success: 1,
                            message: 'Người dùng đã đăng nhập',
                            user: decode
                        });
                    } else {
                        res.send({
                            success: 0,
                            message: 'Tài khoản người dùng đã bị khóa'
                        });
                    }
            })
        } else{
            res.send({
                success: 0,
                message: 'Người dùng chưa đăng nhập'
            });
        };
    } catch(error){
        console.log(error);
        res.send({
            success: 0,
            message: 'Token không đúng'
        });
    }
})
module.exports = AuthRouter;