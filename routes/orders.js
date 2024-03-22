const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const OrdersModel = require("../models/orders");
const ProductsModel = require("../models/products");
const UsersModel = require("../models/users");
const NotificationsModel = require("../models/notifications");
const ReturnsModel = require("../models/returns");

route.get("/getOrders", async (req, res) => {
  try {
    const orders = await OrdersModel.find().maxTimeMS(20000);
    const token = jwt.sign({ orders }, config.secretKey);
    res.json({ token, orders });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getOrder/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await OrdersModel.findById(orderId).maxTimeMS(20000);
    const token = jwt.sign({ order }, config.secretKey);
    res.json({ token, order });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addOrder", async (req, res) => {
  try {
    const {
      nameClient,
      phone1Client,
      phone2Client,
      store,
      address,
      idProduct,
      nameProduct,
      sizeProduct,
      imageProduct,
      amount,
      price,
      phoneCompany,
      nameCompany,
      imageURLCompany,
      color,
      totalPriceProducts,
      gainMarketer,
      gainAdmin,
      marketer,
      deliveryPrice,
    } = req.body;

    console.log(deliveryPrice);

    const product = await ProductsModel.findOne({ _id: idProduct });
    const nameMarketer = await UsersModel.findOne({ name: marketer });

    if (product) {
      const newSize = product.size.map((sizeItem) => {
        if (sizeItem.size === sizeProduct) {
          const newStore = sizeItem.store.map((storeItem) => {
            if (storeItem.nameStore === store) {
              storeItem.amount -= amount;
            }
            return storeItem;
          });
          return { ...sizeItem, store: newStore };
        }
        return sizeItem;
      });
      await ProductsModel.findByIdAndUpdate(
        idProduct,
        { size: newSize },
        { new: true }
      );

      product.numbersSells = +product.numbersSells + 1;
      await product.save();
    } else {
      const product2 = await ProductsModel.findOne({
        "products._id": idProduct,
      });
      if (product2) {
        const productToUpdate = product2.products.filter(
          (item) => item._id.toString() === idProduct
        );

        productToUpdate[0].numbersSells = productToUpdate[0].numbersSells + 1;
        await product2.save();

        const newSize = productToUpdate[0].size.map((sizeItem) => {
          if (sizeItem.size === sizeProduct) {
            const newStore = sizeItem.store.map((storeItem) => {
              if (storeItem.nameStore === store) {
                storeItem.amount -= amount;
              }
              return storeItem;
            });
            return { ...sizeItem, store: newStore };
          }
          return sizeItem;
        });
        await ProductsModel.updateOne(
          { "products._id": idProduct },
          { $set: { "products.$.size": newSize } }
        );
      } else {
        console.log(2);
      }
    }

    function extractLinks(arr) {
      let links = [];
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (Array.isArray(item)) {
            links = links.concat(extractLinks(item));
          } else {
            links.push(item);
          }
        });
      }

      return links;
    }
    const allLinks = extractLinks(imageProduct);

    const DataProducts = {
      idProduct: idProduct,
      nameProduct: nameProduct,
      imageProduct: allLinks[0],
      amount: amount,
      price: price,
      size: sizeProduct,
    };

    const order = new OrdersModel({
      nameClient: nameClient,
      phone1Client: phone1Client,
      phone2Client: phone2Client,
      store: store,
      address: address,
      products: [DataProducts],
      totalPriceProducts: totalPriceProducts,
      gainMarketer: gainMarketer,
      gainAdmin: gainAdmin,
      DeliveryName: "",
      DeliveryPhone: "",
      marketer: marketer,
      deliveryPrice: deliveryPrice,
      situation: "بإنتظار الموافقة",
      PhoneCompany: phoneCompany,
      NameCompany: nameCompany,
      ImageURLCompany: imageURLCompany,
      ColorCompany: color,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    order.situationSteps.push({
      situation: "بإنتظار الموافقة",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    await order.save();
    if (order) {
      nameMarketer.orders.push(order._id);
    }
    await nameMarketer.save();
    return res.status(200).send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/addOrderProducts", async (req, res) => {
  try {
    const {
      nameClient,
      phone1Client,
      phone2Client,
      store,
      address,
      products,
      sizes,
      phoneCompany,
      nameCompany,
      imageURLCompany,
      color,
      amountAndPrice,
      totalPriceProducts,
      gainMarketer,
      gainAdmin,
      marketer,
      userValidity,
      deliveryPrice,
    } = req.body;

    const nameMarketer = await UsersModel.findOne({ name: marketer });

    for (const [productId, { quantity }] of Object.entries(amountAndPrice)) {
      const product = await ProductsModel.findById(productId);

      const sizeFound = sizes.find(([id]) => id === productId);
      const [, size] = sizeFound;

      if (product) {
        const newSize = product.size.map((sizeItem) => {
          if (sizeItem.size === size) {
            const storeToUpdate = sizeItem.store.find(
              (storeItem) => storeItem.nameStore === store
            );

            if (storeToUpdate) {
              storeToUpdate.amount -= parseInt(quantity, 10);
            }
          }

          return sizeItem;
        });
        product.numbersSells = +product.numbersSells + 1;
        await product.save();
        await ProductsModel.findByIdAndUpdate(
          productId,
          { size: newSize },
          { new: true }
        );
      } else {
        const product2 = await ProductsModel.findOne({
          "products._id": productId,
        });

        if (product2) {
          const productToUpdate = product2.products.find(
            (item) => item._id.toString() === productId
          );

          const newSize = productToUpdate.size.map((sizeItem) => {
            if (sizeItem.size === size) {
              const storeToUpdate = sizeItem.store.find(
                (storeItem) => storeItem.nameStore === store
              );

              if (storeToUpdate) {
                storeToUpdate.amount -= parseInt(quantity, 10);
              }
            }

            return sizeItem;
          });

          productToUpdate.numbersSells = +productToUpdate.numbersSells + 1;
          await product2.save();

          await ProductsModel.updateOne(
            { "products._id": productId },
            { $set: { "products.$.size": newSize } }
          );
        } else {
          console.log("المنتج غير موجود");
        }
      }
    }

    const dataProducts = products.map((product, index) => ({
      idProduct: product._id,
      nameProduct: product.name,
      imageProduct: product.image[0],
      amount: amountAndPrice[product._id]?.quantity || 0,
      price: amountAndPrice[product._id]?.price || 0,
      gainMarketer: userValidity !== "مندوب تسويق" ? 0 : product.gainMarketer,
      gainAdmin:
        userValidity !== "مندوب تسويق"
          ? -product.price1 + product.price3
          : -product.price1 + product.price2 - product.gainMarketer,
      size: sizes.find((item2) => item2[0] === product._id)?.[1],
    }));

    const order = new OrdersModel({
      nameClient: nameClient,
      phone1Client: phone1Client,
      phone2Client: phone2Client,
      store: store,
      address: address,
      products: dataProducts,
      totalPriceProducts: totalPriceProducts,
      gainMarketer: gainMarketer,
      gainAdmin: gainAdmin,
      marketer: marketer,
      DeliveryName: "",
      DeliveryPhone: "",
      PhoneCompany: phoneCompany,
      NameCompany: nameCompany,
      ImageURLCompany: imageURLCompany,
      ColorCompany: color,
      deliveryPrice: deliveryPrice,
      situation: "بإنتظار الموافقة",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
    order.situationSteps.push({
      situation: "بإنتظار الموافقة",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    if (order) {
      nameMarketer.orders.push(order._id);
    }
    await order.save();
    await nameMarketer.save();
    return res.status(200).send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/editOrder", async (req, res) => {
  try {
    const {
      id,
      nameClient,
      phone1Client,
      phone2Client,
      store,
      address,
      produtss,
      amount,
      totalPriceProducts,
      gainMarketer,
    } = req.body;

    function extractLinks(arr) {
      let links = [];
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (Array.isArray(item)) {
            links = links.concat(extractLinks(item));
          } else {
            links.push(item);
          }
        });
      }

      return links;
    }
    const allLinks = extractLinks(produtss.map((item) => item.imageProduct));

    const order = await OrdersModel.findOne({ _id: id });
    const dataProducts = produtss.map((product) => ({
      idProduct: product.idProduct,
      nameProduct: product.nameProduct,
      imageProduct: allLinks[0],
      amount: +amount[product.idProduct] || 0,
      price: product.price || 0,
      size: product.size || "",
    }));

    order.nameClient = nameClient;
    order.phone1Client = phone1Client;
    order.phone2Client = phone2Client;
    order.address = address;
    order.products = dataProducts;
    order.totalPriceProducts = totalPriceProducts;
    order.gainMarketer = gainMarketer;

    await order.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/editOrderSituation", async (req, res) => {
  try {
    const { idOrder, situationOrder } = req.body;
    const order = await OrdersModel.findOne({ _id: idOrder });
    order.situationSteps = situationOrder;
    await order.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/editOrderSituation2", async (req, res) => {
  try {
    const {
      delivery,
      marketer,
      gainMarketer,
      gainAdmin,
      idOrder,
      situationOrder,
      orderMoney,
      deliveryPrice,
      date,
      time,
      notes,
      products,
      store,
      returnOrders,
      noReturnOrders,
    } = req.body;

    const productsNotInReturnOrders = products.filter(
      (product) =>
        !returnOrders.some(
          (orderItem) => orderItem.idProduct === product.idProduct
        )
    );

    const order = await OrdersModel.findOne({ _id: idOrder });
    const nameDelivery = await UsersModel.findOne({ name: delivery });
    const nameMarketer = await UsersModel.findOne({ name: marketer });

    if (situationOrder === "تم التوصيل") {

      console.log(orderMoney - deliveryPrice)
      
      const newNotification = new NotificationsModel({
        person: delivery,
        marketer: marketer,
        message: `يوجد طلبية قد وصلت من خلال مندوب التوصيل ${delivery}`,
        date: date,
        time: time,
        notes: "لا يوجد ملاحظات",
      });

      order.situationSteps.push({
        situation: situationOrder,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });

      nameDelivery.money.push({
        idOrder: idOrder,
        money: orderMoney - deliveryPrice,
        marketer: marketer,
        moneyMarketer: gainMarketer,
        moneyAdmin: gainAdmin,
        notes: "",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        acceptMoney: true,
      });

      await UsersModel.updateOne(
        { name: delivery },
        { $pull: { productsStore: { productsAll: idOrder } } }
      );

      await newNotification.save();
    }
    if (situationOrder === "تم الإسترجاع") {
      order.situationSteps.push({
        situation: situationOrder,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });

      await UsersModel.updateOne(
        { name: delivery },
        { $pull: { productsStore: { productsAll: idOrder } } }
      );

      const productsToAdd = products.map((item) => ({
        idProduct: item.idProduct,
        nameProduct: item.nameProduct,
        imageProduct: item.imageProduct,
        amount: item.amount,
        price: item.price,
        size: item.size,
        store: store,
      }));

      nameDelivery.productsStore.push(...productsToAdd);

      const newNotification = new NotificationsModel({
        person: delivery,
        message: `يوجد طلبيه قد تم إسترجعها مع مندوب التوصيل ${delivery}`,
        date: date,
        time: time,
        notes: notes,
      });

      const newReturns = new ReturnsModel({
        products: products.map((item) => ({
          idProduct: item.idProduct,
          nameProduct: item.nameProduct,
          imageProduct: item.imageProduct,
          amount: item.amount,
          price: item.price,
          size: item.size,
        })),
      });
      await newNotification.save();
      await newReturns.save();
    }
    if (situationOrder === "إسترجاع جزئي") {
      const NoReturnOrders = noReturnOrders.filter(
        (item) =>
          !returnOrders.some((item2) => item2.idProduct === item.idProduct)
      );

      const gainMarketer1 = NoReturnOrders.reduce(
        (calac, alt) => calac + alt.gainMarketer * alt.amount,
        0
      );

      const gainAdmin1 = NoReturnOrders.reduce(
        (calac, alt) => calac + alt.gainAdmin * alt.amount,
        0
      );

      const orderMoney1 = NoReturnOrders.reduce(
        (calac, alt) => calac + alt.price * alt.amount,
        0
      );

      nameDelivery.money.push({
        idOrder: idOrder,
        money: orderMoney1 - deliveryPrice,
        marketer: marketer,
        moneyMarketer: gainMarketer1,
        moneyAdmin: gainAdmin1,
        notes: "",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        acceptMoney: true,
      });

      order.situationSteps.push({
        situation: situationOrder,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });

      await UsersModel.updateOne(
        { name: delivery },
        { $pull: { productsStore: { productsAll: idOrder } } }
      );

      const productsToAdd = returnOrders.map((item) => ({
        idProduct: item.idProduct,
        nameProduct: item.nameProduct,
        imageProduct: item.imageProduct,
        amount: item.amount,
        price: item.price,
        size: item.size,
        store: store,
      }));

      nameDelivery.productsStore.push(...productsToAdd);

      const newNotification = new NotificationsModel({
        person: delivery,
        marketer: marketer,
        message: `يوجد طلبيه قد تم إسترجاها جزئيا مع مندوب التوصيل ${delivery}`,
        date: date,
        time: time,
        notes: notes,
      });

      const newReturns = new ReturnsModel({
        products: NoReturnOrders.map((item) => ({
          idProduct: item.idProduct,
          nameProduct: item.nameProduct,
          imageProduct: item.imageProduct,
          amount: item.amount,
          price: item.price,
          size: item.size,
        })),
      });
      await newNotification.save();
      await newReturns.save();
    }
    const save1 = await order.save();
    const save2 = await nameDelivery.save();
    const save3 = await nameMarketer.save();

    if (save1 && save2 && save3) {
      return res.status(200).send("yes");
    }
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/chatOrder", async (req, res) => {
  try {
    const { idOrder, text, val, user } = req.body;
    const order = await OrdersModel.findOne({ _id: idOrder });

    order.chatMessages.push({
      person: user,
      message: text,
      valid: val,
      seeMessage: false,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    const JsonText = {
      person: user,
      val,
      message: text,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    await order.save();
    return res.status(200).json({
      answer: "yes",
      message: JsonText,
    });
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/showedMessages", async (req, res) => {
  try {
    const { idOrder, val, user } = req.body;
    const order = await OrdersModel.findOne({ _id: idOrder });

    const filteredMessages = order.chatMessages.filter((message) => {
      return message.person !== user || message.valid !== val;
    });

    for (const message of filteredMessages) {
      await OrdersModel.updateOne(
        { _id: idOrder, "chatMessages._id": message._id },
        { $set: { "chatMessages.$.seeMessage": true } }
      );
    }
  } catch (error) {
    return res.status(500).send("no");
  }
});
module.exports = route;
