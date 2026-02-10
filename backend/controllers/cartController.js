import userModel from '../models/userModel.js';

//add items to cart
const addToCart = async (req, res) => {
    try{
        let userData= await userModel.findById(req.userId);
        if(!userData){
            return res.json({
                success:false,
                message:"User not found"
            })
        }
        let cartData = userData.cartData;
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId]=1;
        }
        else{
            cartData[req.body.itemId]+=1;
        }
        await userModel.findByIdAndUpdate(req.userId,{cartData});
        res.json({
            success:true,
            message:"Item added to cart"
        })
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Error while adding to cart"
        })
    }
}

//remove items from cart
const removeFromCart = async (req, res) => {
      try{
        let userData= await userModel.findById(req.userId);
        if(!userData){
            return res.json({
                success:false,
                message:"User not found"
            })
        }
        let cartData = userData.cartData;
        if(cartData[req.body.itemId]>0){
            cartData[req.body.itemId]-=1;
        }
        await userModel.findByIdAndUpdate(req.userId,{cartData});
        res.json({
            success:true,
            message:"Item removed from cart"
        })
        }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Error while removing from cart"
        })
    }
}

//get cart items
const getCart= async (req, res) => {
    try{
        let userData= await userModel.findById(req.userId);
        if(!userData){
            return res.json({
                success:false,
                message:"User not found"
            })
        }
        let cartData= userData.cartData;
        res.json({
            success:true,
            cartData
        })
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Error while getting cart data"
        })
    }
}

export { addToCart, removeFromCart, getCart };

