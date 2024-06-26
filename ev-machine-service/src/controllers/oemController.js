
const createError = require("http-errors")
const Oem = require('../models/OEMSchema');
const mongoose = require('mongoose');
const moment = require('moment');

// Create a new OEM
const createOEM = async (req, res) => {

    let value = req.body
    const doesExist = await Oem.findOne({ name: value.name })
    if (doesExist) throw new Error('Already Exist')
   
   
    const oem = new Oem(value)
    const savedOem = await oem.save()
    res.status(201).json({
        status: true,
        message: 'OK'
    })
}

// get all oem 
const getOEMs = async (req, res) => {

    const { pageNo, searchQuery } = req.query;

    const filter = {};


    if (searchQuery) {
        filter.$or = [
            { name: { $regex: searchQuery, $options: 'i' } }, 
        ];
    }

    const oems = await Oem.find(filter).sort({updatedAt:-1}).skip(10*(pageNo-1)).limit(10);

    let totalCount = await Oem.find(filter).countDocuments()

    const formattedOems = oems.map(oem => ({
        ...oem._doc,
        // Assuming 'createdAt' is the field containing the date
        createdAt: moment(oem.createdAt).format('DD-MM-YYYY '), // Adjust the format as needed
    }));
    res.status(200).json({
        status: true,
        message: 'OK',
        result: formattedOems,
        totalCount
    });
};

const getOEMsDropdown = async (req, res) => {

    const filter = {};

    const oems = await Oem.find(filter).sort({updatedAt:-1})

    let totalCount = await Oem.find(filter).countDocuments()

    const formattedOems = oems.map(oem => ({
        ...oem._doc,
        // Assuming 'createdAt' is the field containing the date
        createdAt: moment(oem.createdAt).format('DD-MM-YYYY '), // Adjust the format as needed
    }));
    res.status(200).json({
        status: true,
        message: 'OK',
        result: formattedOems,
        totalCount
    });
};
// get oem data by id
const getOEM = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`);
    }

    const oem = await Oem.findById(id);
    if (!oem) {
        throw new createError(404, `OEM with id ${id} not found`);
    }
    res.status(200).json({
        status: true,
        message: 'OK',
        result: oem
    });
};

// update oem by id
const updateOEM = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`);
    }

    let value = req.body;

    const oem = await Oem.findByIdAndUpdate(id, value, { new: true });
    if (!oem) {
        throw new createError(404, `OEM with id ${id} not found`);
    }
    res.status(200).json({ message: 'Updated Successfully', result: oem });
};

// delete oem by id
const deleteOEM = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`);
    }

    const oem = await Oem.findByIdAndDelete(id);
    if (!oem) {
        throw new createError(404, `OEM with id ${id} not found`);
    }
    res.status(200).json({ message: 'Deleted Successfully', result: oem });
};


module.exports = {
    createOEM,
    getOEM,
    updateOEM,
    deleteOEM,
    getOEMs,
    getOEMsDropdown
}