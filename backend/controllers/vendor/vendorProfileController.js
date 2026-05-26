import express from 'express';
import User from '../../models/userModel.js';
import mongoose from 'mongoose';


export const getVendorData = async(req,res) => {

    const vendorId = req.user.userId;

    const vendor = await User.findById(vendorId);
    try {
        if(!vendor){
            return res.status(404).json({
                message : "Vendor Not Found"
            });
        }
        return res.status(200).send(vendor);
    } catch (error) {
        return res.status(500).json({
            message : error.message
        })
    }
}