const router = require("express").Router();
const admin = require("firebase-admin");
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

router.post("/create", async (req, res) => {
  try {
    const id = Date.now();
    const data = {
      productID: id,
      product_name: req.body.product_name,
      product_category: req.body.product_category,
      product_price: req.body.product_price,
      imageURL: req.body.imageURL,
    };

    const response = await db.collection("products").doc(`/${id}/`).set(data);
    console.log(response);
    return res.status(200).send({ success: true, data: response });
  } catch (err) {
    return res.send({ success: false, msg: `Error : ${err}` });
  }
});

// get all the products
router.get("/all", async (req, res) => {
  (async () => {
    try {
      let query = db.collection("products");
      let response = [];
      await query.get().then((querysnap) => {
        let docs = querysnap.docs;
        docs.map((doc) => {
          response.push({ ...doc.data() });
        });
        return response;
      });
      return res.status(200).send({ success: true, data: response });
    } catch (err) {
      return res.send({ success: false, msg: `Error : ${err}` });
    }
  })();
});

// delete a product
router.delete("/delete/:productID", async (req, res) => {
  const productID = req.params.productID;
  try {
    await db
      .collection("products")
      .doc(`/${productID}/`)
      .delete()
      .then((result) => {
        return res.status(200).send({ success: true, data: result });
      });
  } catch (err) {
    return res.send({ success: false, msg: `Error : ${err}` });
  }
});

// create a cart
router.post("/addToCart/:userId", async (req, res) => {
  const userId = req.params.userId;
  const productID = req.body.productID;

  try {
    const doc = await db
      .collection("cartItems")
      .doc(`/${userId}/`)
      .collection("items")
      .doc(`/${productID}/`)
      .get();

    if (doc.data()) {
      const quantity = doc.data().quantity + 1;
      const updatedItem = await db
        .collection("cartItems")
        .doc(`/${userId}/`)
        .collection("items")
        .doc(`/${productID}/`)
        .update({ quantity });
      return res.status(200).send({ success: true, data: updatedItem });
    } else {
      const data = {
        productID: productID,
        product_name: req.body.product_name,
        product_category: req.body.product_category,
        product_price: req.body.product_price,
        imageURL: req.body.imageURL,
        quantity: 1,
      };
      const addItems = await db
        .collection("cartItems")
        .doc(`/${userId}/`)
        .collection("items")
        .doc(`/${productID}/`)
        .set(data);
    }
  } catch (err) {
    return res.send({ success: false, msg: `Error : ${err}` });
  }
});

// update cart to increase and decrease the quantity
router.post("updateCart/:user_id", async (req, res) => {
  const userId = req.params.user_id;
  const productID = req.query.productID;
  const type = req.query.type;

  try {
    const doc = await db
      .collection("cartItems")
      .doc(`/${userId}/`)
      .collection("items")
      .doc(`/${productID}/`)
      .get();
    if (doc.data()) {
      if (type === "increment") {
        const quantity = doc.data().quantity + 1;
        const updatedItem = await db
          .collection("cartItems")
          .doc(`/${userId}/`)
          .collection("items")
          .doc(`/${productID}/`)
          .update({ quantity });
        return res.status(200).send({ success: true, data: updatedItem });
      } else {
        if (doc.data().quantity === 1) {
          await db
            .collection("cartItems")
            .doc(`/${userId}/`)
            .collection("items")
            .doc(`/${productID}/`)
            .delete()
            .then((result) => {
              return res.status(200).send({ success: true, data: result });
            });
        } else {
          const quantity = doc.data().quantity - 1;
          const updatedItem = await db
            .collection("cartItems")
            .doc(`/${userId}/`)
            .collection("items")
            .doc(`/${productID}/`)
            .update({ quantity });
          return res.status(200).send({ success: true, data: updatedItem });
        }
      }
    }
  } catch (err) {
    return res.send({ success: false, msg: `Error : ${err}` });
  }
});

// get all the cart items for that user
router.get("/getCartItems/:user_id", async (req, res) => {
  const userId = req.params.user_id;
  (async () => {
    try {
      let query = db
        .collection("cartItems")
        .doc(`/${userId}/`)
        .collection("items");
      let response = [];

      await query.get().then((querysnap) => {
        let docs = querysnap.docs;

        docs.map((doc) => {
          response.push({ ...doc.data() });
        });
        return response;
      });
      return res.status(200).send({ success: true, data: response });
    } catch (err) {
      return res.send({ success: false, msg: `Error : ${err}` });
    }
  })();
});
module.exports = router;
