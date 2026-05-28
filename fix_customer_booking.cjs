const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetOnSubmit = `        onSubmit({
          venueName: myVenue?.name || "Sân chưa xác định",
          timeSlot: \`\${time} \${finalDate}\`,
          pitchType,
          price: parsedPrice,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim()
        });`;

const replacementOnSubmit = `        onSubmit({
          venueName: myVenue?.name || "Sân chưa xác định",
          timeSlot: \`\${time} \${finalDate}\`,
          date: finalDate,
          pitchType,
          price: parsedPrice,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim()
        });`;

code = code.replace(targetOnSubmit, replacementOnSubmit);

const targetSubmitHandler = `      const submitOwnerBookCustomerForm = (formData) => {
        const newSlot = {
          id: 'slot_' + Date.now(),
          venueName: formData.venueName,
          address: "123 Phạm Văn Đồng, Thủ Đức",
          timeSlot: formData.timeSlot,
          type: 'booked',
          status: 'booked',
          pitchType: formData.pitchType,
          price: formData.price,
          contact: currentUser.phone,
          customerPhone: formData.customerPhone,
          notes: \`Khách: \${formData.customerName} (\${formData.customerPhone}). \${formData.notes}\`,
          owner_user_id: currentUser.id
        };
        setSlots(prev => [newSlot, ...prev]);
        setModalType(null);
        alert(\`✅ Đã ghi nhận sân \${formData.timeSlot} được chốt bởi khách \${formData.customerName}!\`);
      };`;

const replacementSubmitHandler = `      const submitOwnerBookCustomerForm = (formData) => {
        const newSlot = {
          id: 'slot_' + Date.now(),
          venueName: formData.venueName,
          address: "123 Phạm Văn Đồng, Thủ Đức",
          timeSlot: formData.timeSlot,
          rawTime: formData.date,
          type: 'booked',
          status: 'booked',
          pitchType: formData.pitchType,
          price: formData.price,
          contact: currentUser.phone,
          customerPhone: formData.customerPhone,
          notes: \`Khách: \${formData.customerName} (\${formData.customerPhone}). \${formData.notes}\`,
          owner_user_id: currentUser.id
        };
        setSlots(prev => [newSlot, ...prev]);
        setModalType(null);
        alert(\`✅ Đã ghi nhận sân \${formData.timeSlot} được chốt bởi khách \${formData.customerName}!\`);
        setCurrentTab("owner_ql_san");
      };`;

code = code.replace(targetSubmitHandler, replacementSubmitHandler);

fs.writeFileSync('src/App.jsx', code);
console.log("Customer booking fixed");
