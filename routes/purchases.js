const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
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

    for (const productId in inputValues) {
      const { selectedSize, selectedStore } = inputValues[productId];
      const storeObjects = selectedStore.map((storeName) => {
        const storedValue = inputValues[productId][storeName];
        const amount =
          storedValue && !isNaN(Number(storedValue)) ? Number(storedValue) : 0;
        return {
          nameStore: storeName,
          amount: amount,
        };
      });

      if (selectedStore && selectedStore.length > 0) {
        for (const storeName of selectedStore) {
          const store = await StoresModel.findOne({ gbs: storeName });

          if (store) {
            if (!store.products.includes(productId)) {
              store.products.push(productId);
              await store.save();
            } else {
              console.log(`already ProductIs`);
            }
          } else {
            console.error(`المخزن ${storeName} غير موجود.`);
          }
        }
      }

      for (const nameStore of storeObjects) {
        console.log(nameStore);

        // const store = await StoresModel.findOne({ gbs: storeName });

        // if (store) {
        //   if (!store.products.includes(productId)) {
        //     store.products.push(productId);
        //     await store.save();
        //   } else {
        //     console.log(`already ProductIs`);
        //   }
        // } else {
        //   console.error(`المخزن ${storeName} غير موجود.`);
        // }
      }

      // console.log(storeObjects)

      const updatedMainProduct = await ProductsModel.findOneAndUpdate(
        { _id: productId, "size.size": { $in: selectedSize } },
        {
          $set: {
            "size.$[innerElem].store": storeObjects,
          },
        },
        {
          arrayFilters: [{ "innerElem.size": { $in: selectedSize } }],
          new: true,
        }
      );

      if (!updatedMainProduct) {
        console.error("MainProduct not found:", productId);
      }
    }

    for (const productId in inputValues) {
      const { selectedSize, selectedStore } = inputValues[productId];
      const storeObjects = selectedStore.map((storeName) => {
        const storedValue = inputValues[productId][storeName];
        const amount =
          storedValue && !isNaN(Number(storedValue)) ? Number(storedValue) : 0;
        return {
          nameStore: storeName,
          amount: amount,
        };
      });

      try {
        const updatedMainProduct = await ProductsModel.findOneAndUpdate(
          { "products._id": productId },
          {
            $set: {
              "products.$[elem].size.$[innerElem].store": storeObjects || [],
            },
          },
          {
            arrayFilters: [
              { "elem._id": productId },
              { "innerElem.size": { $in: selectedSize } },
            ],
            new: true,
          }
        );

        if (!updatedMainProduct) {
          console.error("Main product not found.");
          continue;
        }

        for (const subProduct of updatedMainProduct.products) {
          if (subProduct._id.toString() === productId) {
            continue;
          }

          const updatedSubProduct = await ProductsModel.findOneAndUpdate(
            { "products._id": subProduct._id },
            {
              $set: {
                "products.$[elem].size.$[innerElem].store": storeObjects || [],
              },
            },
            {
              arrayFilters: [
                { "elem._id": subProduct._id },
                { "innerElem.size": { $in: selectedSize } },
              ],
              new: true,
            }
          );

          if (!updatedSubProduct) {
            console.error("Subproduct not found:", subProduct._id);
          }
        }

        if (selectedStore && selectedStore.length > 0) {
          for (const storeName of selectedStore) {
            const store = await StoresModel.findOne({ gbs: storeName });

            if (store) {
              if (!store.products.includes(productId)) {
                store.products.push(productId);
                await store.save();
              } else {
                console.log(`already ProductIs`);
              }
            } else {
              console.error(`المخزن ${storeName} غير موجود.`);
            }
          }
        }
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }

    let sum = 0;

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

      const totalAmount = Object.values(selectedStore).reduce(
        (acc, storeName) => {
          const storeAmount = parseInt(productData[storeName]) || 0;

          sum += storeAmount * findPrice(productId);

          return acc + storeAmount;
        },
        0
      );

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
