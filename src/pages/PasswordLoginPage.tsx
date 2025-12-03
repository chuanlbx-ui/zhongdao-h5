// ... 在错误处理部分添加详细的错误信息显示
const handlePasswordRegister = async () => {
  try {
    // ... 现有代码 ...
    const response = await registerWithPassword({
      phone,
      password,
      referralCode
    });
    // ... 成功处理 ...
  } catch (error: any) {
    // 新增：详细的错误信息处理
    const errorCode = error.response?.data?.error?.code;
    const errorMessage = error.response?.data?.error?.message;
    const errorDetails = error.response?.data?.error?.details;
    
    let displayMessage = errorMessage || '注册失败，请稍后重试';
    
    // 根据错误码显示不同的提示信息
    if (errorCode === 'USER_EXISTS') {
      displayMessage = `${errorMessage}\n${errorDetails?.suggestion || ''}`;
      // 可选：显示"去登录"按钮
    } else if (errorCode === 'INVALID_REFERRAL_CODE') {
      displayMessage = `推荐码错误：${errorMessage}\n${errorDetails?.suggestion || ''}`;
    }
    
    // 显示错误提示
    message.error(displayMessage);
  }
};

// 在成功注册后显示推荐码
const handleRegisterSuccess = (data: any) => {
  message.success('注册成功！');
  
  // 显示推荐码信息
  if (data.referralInfo?.yourCode) {
    Modal.info({
      title: '推荐码已生成',
      content: (
        <div>
          <p>您的专属推荐码：<strong>{data.referralInfo.yourCode}</strong></p>
          <p>{data.referralInfo.message}</p>
          <Button 
            type="primary" 
            onClick={() => {
              navigator.clipboard.writeText(data.referralInfo.yourCode);
              message.success('推荐码已复制！');
            }}
          >
            复制推荐码
          </Button>
        </div>
      )
    });
  }
};