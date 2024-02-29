const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const mongoose = require("mongoose");
const PurchasesModel = require("../models/purchases");
const ProductsModel = require("../models/products");
const PaymentModel = require("../models/payment");
const SuppliersModel = require("../models/suppliers");
const StoresModel = require("../models/store");

route.get("/getPurchases", async (req, res) => {
  try {
    const purchases = await PurchasesModel.find().maxTimeMS(20000);
    const token = jwt.sign({ purchases }, config.secretKey);
    res.json({ token, purchases });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getpurchase/:id", async (req, res) => {
  const purchaseName = req.params.id;

  try {
    const purchase = await PurchasesModel.findOne({ name: purchaseName });
    if (!purchase) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على بيانات الدفع" });
    }
    res.json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الدفع" });
  }
});

route.post("/addPurchases", async (req, res) => {
  try {
    const { inputValues, supplier, moneySafe, ProductsName, totalBuy } =
      req.body;

    const numberOfProducts = Object.keys(inputValues).length;

    for (const productId in inputValues) {
      const { selectedSize, selectedStore } = inputValues[productId];

      if (selectedStore && selectedStore.length > 0) {
        for (const storeName of selectedStore) {
          const store = await StoresModel.findOne({ gbs: storeName });

          if (store && !store.products.includes(productId)) {
            store.products.push(productId);
            await store.save();
          }
        }
      }

      const storeObjects = selectedStore.map((storeName) => {
        const storedValue = inputValues[productId][storeName];
        const amount =
          storedValue && !isNaN(Number(storedValue)) ? Number(storedValue) : 0;
        return {
          nameStore: storeName,
          amount: amount,
          _id: new mongoose.Types.ObjectId().toString(),
        };
      });

      const productSearch = await ProductsModel.findOne({ _id: productId });
      const productSearch2 = await ProductsModel.findOne({
        "products._id": productId,
      });

      const updatedStores = new Set(); // To track updated stores

      for (const sizeKey of selectedSize) {
        const productSize =
          productSearch?.size.find((item) => item.size === sizeKey) ||
          productSearch2?.products
            .find((item) => item._id.toString() === productId)
            ?.size.find((item) => item.size === sizeKey);

        if (productSize) {
          for (const storeKey of selectedStore) {
            const productStore = productSize.store.find(
              (item) => item.nameStore === storeKey
            );

            const foundStore = storeObjects.find(
              (store) => store.nameStore === storeKey
            );
            if (productStore && foundStore && !updatedStores.has(storeKey)) {
              const amount = foundStore.amount;
              productStore.amount += +amount;
              updatedStores.add(storeKey);
            } else {
              productSize.store.push({
                nameStore: foundStore.nameStore,
                amount: foundStore.amount,
                _id: foundStore._id,
              });
            }
          }
        }
      }

      if (productSearch) {
        await productSearch.save();
      } else if (productSearch2) {
        await productSearch2.save();
      }
    }

    const productsArray = Object.keys(inputValues).map((productId) => {
      const productData = inputValues[productId];
      const selectedStore = productData.selectedStore;
      const productNames = ProductsName.map((item) => item.name);

      const findPrice = (productId) => {
        let productPrice;

        ProductsName.forEach((mainProduct) => {
          const subProduct = mainProduct.products.find(
            (subProduct) => subProduct._id === productId
          );

          if (subProduct) {
            productPrice = subProduct.price1;
          }
        });

        if (!productPrice) {
          const mainProduct = ProductsName.find(
            (product) => product._id === productId
          );
          if (mainProduct) {
            productPrice = mainProduct.price1;
          } else {
            console.error(`Product with ID ${productId} not found`);
          }
        }
        return productPrice;
      };

      const findImage = (productId) => {
        let productImage;
        ProductsName.forEach((mainProduct) => {
          const subProduct = mainProduct.products.find(
            (subProduct) => subProduct._id === productId
          );
          if (subProduct) {
            productImage = subProduct.image[0];
          }
        });
        if (!productImage) {
          const mainProduct = ProductsName.find(
            (product) => product._id === productId
          );
          if (mainProduct) {
            productImage = mainProduct.image[0];
          } else {
            console.error(`Product with ID ${productId} not found`);
          }
        }
        return productImage;
      };

      const products = selectedStore.map((storeName) => {
        const storeAmount = parseInt(productData[storeName]) || 0;
        const productName = productNames[selectedStore.indexOf(storeName)];
        return {
          name: productName,
          image: findImage(productId),
          details: productData.selectedSize.map((size) => ({
            size,
            store: [
              {
                nameStore: storeName,
                amount: storeAmount,
                price: findPrice(productId),
              },
            ],
          })),
        };
      });

      return {
        productId,
        products,
      };
    });

    const productsArrayAmount = Object.keys(inputValues).map((productId) => {
      const productData = inputValues[productId];
      const selectedStore = productData.selectedStore;
      const totalQuantities = {};

      selectedStore.forEach((store) => {
        const storeAmount = parseInt(productData[store]) || 0;
        totalQuantities[store] = (totalQuantities[store] || 0) + storeAmount;
      });

      const totalAmount = Object.values(totalQuantities).reduce(
        (acc, amount) => acc + amount,
        0
      );

      return {
        totalAmount,
      };
    });

    const totalAmountAllProducts = productsArrayAmount.reduce(
      (acc, product) => acc + product.totalAmount,
      0
    );

    const purchases = new PurchasesModel({
      Products: productsArray.flatMap((purchase) => purchase.products),
      payment: 0,
      totalProducts: totalAmountAllProducts,
      totalPrice: totalBuy,
      indebt: 0,
      supplier: supplier,
      moneySafe: moneySafe,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    const saveResult1 = await purchases.save();
    if (saveResult1) {
      const Namesupplier = await SuppliersModel.findOneAndUpdate(
        { name: supplier },
        { $push: { purchases: { id: saveResult1._id } } },
        { new: true }
      );

      if (Namesupplier) {
        res.status(200).send("yes");
      } else {
        return res.send("no");
      }
    } else {
      return res.send("no");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("حدث خطأ أثناء حفظ البيانات");
  }
});

route.post("/paymentPurchases", async (req, res) => {
  try {
    const { id, Price, payment, employee, supplier } = req.body;

    const purchase = await PurchasesModel.findOne({ _id: id });
    const Supplier = await SuppliersModel.findOne({ name: supplier });
    const money = await PaymentModel.findOne({ name: payment });

    purchase.indebt = +purchase.indebt + +Price;

    money.money.push({
      value: -Price,
      notes: `من خلال شراء منتجات`,
      person: employee || "-",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    Supplier.indept = +Supplier.indept + +Price;

    purchase.stepsPayment.push({
      price: Price,
      employee: employee,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    const save1 = await purchase.save();
    const save2 = await money.save();
    const save3 = await Supplier.save();

    if (save1 && save2 && save3) {
      return res.status(200).send("yes");
    }
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;
