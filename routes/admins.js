const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const AdminsModel = require("../models/admins");

route.get("/getAdmins", async (req, res) => {
  try {
    const admins = await AdminsModel.find().maxTimeMS(20000);
    const token = jwt.sign({ admins }, config.secretKey);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// route.get("/getemployee/:id", async (req, res) => {
//   const employeeName = req.params.id;

//   try {
//     const employee = await EmployeesModel.findOne({ name: employeeName });
//     if (employee) {
//       res.json(employee);
//     } else {
//       res.status(404).json({ message: "لا يوجد مستخدم بهذا الاسم" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الموظف" });
//   }
// });

route.post("/login", async (req, res) => {
  const { name, password } = req.body;
  console.log(name, password);
  try {
    const admin = await AdminsModel.findOne({ name });

    if (!admin) {
      return res.send("notFoundAdmin");
    }
    console.log(admin.password);

    const comparePassword = await bcyrbt.compare(password, admin.password);
    if (admin.password !== password ) {
      return res.send("noPassword");
    }
    if (admin.validity !== "adminTwo") {
      return res.send("noValidity");
    }

    return res.send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("error");
  }
});

route.post("/signUp", async (req, res) => {
  const { name, phone, password } = req.body;
  const user = await UsersModel.findOne({ name });
  if (user) {
    return res.send("no");
  }

  const hashedPassword = await bcyrbt.hash(password, saltRounds);
  const newUser = new UsersModel({
    name: name,
    phone: phone,
    password: hashedPassword,
    validity: "marketer",
  });

  const save = await newUser.save();
  if (save) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("error");
});

// route.post("/editemployee", async (req, res) => {
//   try {
//     const { id, name, phone1, phone2, generatedPassword } = req.body;
//     const employee = await EmployeesModel.findOne({ _id: id });
//     employee.name = name;
//     employee.phone1 = phone1;
//     employee.phone2 = phone2;
//     employee.generatedPassword = generatedPassword;

//     await employee.save();
//     return res.status(200).send("yes");
//   } catch (error) {
//     return res.status(500).send("no");
//   }
// });

// route.post("/editMoneySafe", async (req, res) => {
//   try {
//     const { nameEmployeeFrom, nameEmployeeTo, totalMoney } = req.body;

//     console.log(nameEmployeeFrom, nameEmployeeTo, totalMoney);

//     const employeeFrom = await EmployeesModel.findOne({
//       name: nameEmployeeFrom,
//     });
//     const employeeTo = await EmployeesModel.findOne({
//       name: nameEmployeeTo,
//     });

//     if (employeeFrom && employeeTo && parseFloat(totalMoney) > 0) {
//       const safeEntryFrom = {
//         patient: "-",
//         employee: nameEmployeeTo,
//         notes: `تم التحويل الي ${nameEmployeeTo}`,
//         money: parseFloat(totalMoney) * -1,
//         date: new Date().toLocaleDateString(),
//         time: new Date().toLocaleTimeString(),
//       };

//       const safeEntryTo = {
//         patient: "-",
//         employee: nameEmployeeFrom,
//         notes: `تم الاستلام من ${nameEmployeeFrom}`,
//         money: parseFloat(totalMoney),
//         date: new Date().toLocaleDateString(),
//         time: new Date().toLocaleTimeString(),
//       };

//       employeeFrom.theSafe.push(safeEntryFrom);
//       employeeTo.theSafe.push(safeEntryTo);

//       await employeeFrom.save();
//       await employeeTo.save();
//       return res.status(200).send("yes");
//     }
//   } catch (error) {
//     return res.status(500).send("no");
//   }
// });

// route.delete("/deleteemployee/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await EmployeesModel.findByIdAndDelete(id);
//     res.json("yes");
//   } catch (error) {
//     res.status(500).json("no");
//   }
// });

module.exports = route;

// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const MyComponent = () => {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // توليد التوقيع باستخدام المفتاح السري
//         const response = await axios.get('/api/getUsers', {
//           headers: {
//             Authorization: `Bearer ${yourSecretKeyHere}`,
//           },
//         });

//         // استخدام البيانات المستلمة
//         setUsers(response.data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h1>قائمة المستخدمين</h1>
//       <ul>
//         {users.map((user) => (
//           <li key={user.id}>{user.name}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MyComponent;
