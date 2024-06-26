require('dotenv').config()
const { khaltiService, khaltiCallback } = require('khalti-payment')
const { KHALTI_GATEWAY_URL, KHALTI_SECRET_KEY, KHALTI_RETURN_URL } = process.env
const paymentService = require('../services/razorpayService')
const createError = require('http-errors')
const crypto = require('crypto')
const paymentOrderSchema = require('../validation/paymentOrderSchema')
const {
  addWalletTransaction,
  updateWalletTransaction,
} = require('../services/transactionService')

// API 1
exports.createPaymentOrder = async (req, res) => {
  //validation checks
  // Validate the request body against the schema
  // const { error, value } = paymentOrderSchema.validate(req.body)

  // if (error)
  //   throw new createError(
  //     400,
  //     error.details.map((detail) => detail.message).join(', ')
  //   )

  // Access the validated data in the 'value' object
  const { amount, currency, userId, type } = req.body
  if (!userId) throw new createError(400, 'UserId required for payment order')

  const paymentGateway = 'Razorpay'
  let order
  if (paymentGateway === 'Razorpay') {
    order = await paymentService.createRazorPaymentOrder(amount, currency)
  } else {
    const payload = {
      return_url: KHALTI_RETURN_URL,
      website_url: 'https://example.com/',
      amount: amount * 100,
      purchase_order_id: 'test12',
      purchase_order_name: `wallet_${userId}`,
    }

    const config = {
      KHALTI_GATEWAY_URL,
      KHALTI_SECRET_KEY,
    }

    order = await khaltiService(payload, config)
  }

  addWalletTransaction({
    user: userId,
    amount: amount,
    type: type || 'wallet top-up',
    currency: currency,
    transactionId: order.id,
  })

  //create new transaction wallet
  res.status(200).json({ status: true, result: order })
}

// API 2
exports.paymentVerify = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body

  const sign = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
    .update(sign.toString())
    .digest('hex')

  await updateWalletTransaction(
    razorpay_order_id,
    razorpay_signature === expectedSign ? 'success' : 'failure',
    razorpay_payment_id
  )

  //Aswin update transaction
  if (razorpay_signature !== expectedSign)
    throw new createError(402, 'Payment verification failed!')

  // conditional save of rfid/topup charge
  res
    .status(200)
    .json({ status: true, message: 'Payment verified successfully' })
}

exports.khaltiVerify = async (req, res) => {
  const config = {
    KHALTI_GATEWAY_URL,
    KHALTI_SECRET_KEY,
  }

  const paymentStatus = await khaltiCallback(req, config)
  // await updateWalletTransaction(
  //   txnId,
  //   status,
  //   purchase_order_id
  // )

  res
    .status(200)
    .json({
      status: true,
      message: 'Payment verified successfully',
      paymentStatus,
    })
}
