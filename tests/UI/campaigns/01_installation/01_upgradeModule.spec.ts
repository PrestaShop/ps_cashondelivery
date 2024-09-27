import {
  boDashboardPage,
  boLoginPage,
  boMaintenancePage,
  boModuleManagerPage,
  boShopParametersPage,
  dataCustomers,
  dataModules,
  foClassicCartPage,
  foClassicCheckoutPage,
  foClassicHomePage,
  foClassicLoginPage,
  foClassicModalQuickViewPage,
  opsBOModules,
  utilsTest,
  foClassicModalBlockCartPage,
} from '@prestashop-core/ui-testing';
import { test, expect, Page, BrowserContext } from '@playwright/test';

const baseContext: string = 'modules_ps_cashondelivery_installation_upgradeModule';

test.describe('Cash on delivery (COD) module: Upgrade module', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    browserContext = await browser.newContext();
    page = await browser.newPage({
      recordVideo: {
        dir: testInfo.outputPath('videos'),
      }
    });
  });
  test.afterAll(async ({}, testInfo) => {
    const videoPath = testInfo.outputPath('my-video.webm');
    await Promise.all([
      page.video()!.saveAs(videoPath),
      page.close()
    ]);
    testInfo.attachments.push({
      name: 'video',
      path: videoPath,
      contentType: 'video/webm'
    });
    await page.close();
  });

  test('Upgrade with shop on maintenance : should uninstall the module', async function () {
    await opsBOModules.uninstallModule(page, dataModules.psCashOnDelivery, `${baseContext}_preTest_0`);
  });

  test('Upgrade with shop on maintenance : should install the module in previous version', async function () {
    await opsBOModules.installModule(page, dataModules.psCashOnDelivery, false, `${baseContext}_preTest_1`);
  });

  test('Upgrade with shop on maintenance : should login in BO', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'loginBO', baseContext);

    await boLoginPage.goTo(page, global.BO.URL);
    await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

    const pageTitle = await boDashboardPage.getPageTitle(page);
    expect(pageTitle).toContain(boDashboardPage.pageTitle);
  });

  test('Upgrade with shop on maintenance : should go to \'Shop parameters > General\' page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToShopParamsPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.shopParametersParentLink,
      boDashboardPage.shopParametersGeneralLink,
    );
    await boShopParametersPage.closeSfToolBar(page);

    const pageTitle = await boShopParametersPage.getPageTitle(page);
    expect(pageTitle).toContain(boShopParametersPage.pageTitle);
  });

  test('Upgrade with shop on maintenance : should go to \'Maintenance\' tab', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToMaintenancePage', baseContext);

    await boShopParametersPage.goToSubTabMaintenance(page);

    const pageTitle = await boMaintenancePage.getPageTitle(page);
    expect(pageTitle).toContain(boMaintenancePage.pageTitle);
  });

  test('Upgrade with shop on maintenance : should disable the shop', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'disableShop', baseContext);

    const resultStatus = await boMaintenancePage.changeShopStatus(page, false);
    expect(resultStatus).toContain(boMaintenancePage.successfulUpdateMessage);

    const resultLoggedInEmployees = await boMaintenancePage.changeStoreForLoggedInEmployees(page, false);
    expect(resultLoggedInEmployees).toContain(boMaintenancePage.successfulUpdateMessage);
  });

  test('Upgrade with shop on maintenance : should verify the existence of the maintenance text', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'verifyMaintenanceText', baseContext);

    page = await boMaintenancePage.viewMyShop(page);

    const pageContent = await foClassicHomePage.getTextContent(page, foClassicHomePage.content);
    expect(pageContent).toEqual(boMaintenancePage.maintenanceText);
  });

  test('Upgrade with shop on maintenance : should go to \'Modules > Module Manager\' page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToModuleManagerPage', baseContext);

    // Go back to BO
    page = await foClassicHomePage.closePage(browserContext, page, 0);
    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.modulesParentLink,
      boDashboardPage.moduleManagerLink,
    );
    await boModuleManagerPage.closeSfToolBar(page);

    const pageTitle = await boModuleManagerPage.getPageTitle(page);
    expect(pageTitle).toContain(boModuleManagerPage.pageTitle);
  });

  test(`Upgrade with shop on maintenance : should search the module ${dataModules.psCashOnDelivery.name}`, async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'searchModule', baseContext);

    const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psCashOnDelivery);
    expect(isModuleVisible).toBeTruthy();

    const moduleInfo = await boModuleManagerPage.getModuleInformationNth(page, 1);
    expect(dataModules.psCashOnDelivery.versionOld).toContain(moduleInfo.version);
  });

  test('Upgrade with shop on maintenance : should display the upgrade modal and cancel it', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'resetModuleAndCancel', baseContext);

    const textResult = await boModuleManagerPage.setActionInModule(page, dataModules.psCashOnDelivery, 'upgrade', true);
    expect(textResult).toEqual('');

    const isModuleVisible = await boModuleManagerPage.isModuleVisible(page, dataModules.psCashOnDelivery);
    expect(isModuleVisible).toBeTruthy();

    const isModalVisible = await boModuleManagerPage.isModalActionVisible(page, dataModules.psCashOnDelivery, 'upgrade');
    expect(isModalVisible).toBeFalsy();
  });

  test('Upgrade with shop on maintenance : should upgrade the module', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'resetModule', baseContext);

    const successMessage = await boModuleManagerPage.setActionInModule(page, dataModules.psCashOnDelivery, 'upgrade', false, true);
    expect(successMessage).toEqual(boModuleManagerPage.updateModuleSuccessMessage(dataModules.psCashOnDelivery.tag));
  });

  test('Upgrade with shop on maintenance : should reload the page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkModule', baseContext);

    await boModuleManagerPage.reloadPage(page);

    const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psCashOnDelivery);
    expect(isModuleVisible).toBeTruthy();

    const moduleInfo = await boModuleManagerPage.getModuleInformationNth(page, 1);
    expect(dataModules.psCashOnDelivery.versionCurrent).toContain(moduleInfo.version);
  });

  test('Upgrade with shop on maintenance : should return to \'Shop parameters > General\' page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'returnToShopParamsPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.shopParametersParentLink,
      boDashboardPage.shopParametersGeneralLink,
    );
    await boShopParametersPage.closeSfToolBar(page);

    const pageTitle = await boShopParametersPage.getPageTitle(page);
    expect(pageTitle).toContain(boShopParametersPage.pageTitle);
  });

  test('Upgrade with shop on maintenance : should return to \'Maintenance\' tab', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'returnToMaintenancePage', baseContext);

    await boShopParametersPage.goToSubTabMaintenance(page);

    const pageTitle = await boMaintenancePage.getPageTitle(page);
    expect(pageTitle).toContain(boMaintenancePage.pageTitle);
  });

  test('Upgrade with shop on maintenance : should enable the shop', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'enableShop', baseContext);

    const result = await boMaintenancePage.changeShopStatus(page, true);
    expect(result).toContain(boMaintenancePage.successfulUpdateMessage);
  });

  test('Upgrade with shop on maintenance : should go to the front office', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToTheFo', baseContext);

    page = await boModuleManagerPage.viewMyShop(page);
    await foClassicHomePage.changeLanguage(page, 'en');

    const isHomePage = await foClassicHomePage.isHomePage(page);
    expect(isHomePage).toBeTruthy();
  });

  test('Upgrade with shop on maintenance : should go to login page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToLoginPageFO', baseContext);

    await foClassicHomePage.goToLoginPage(page);

    const pageTitle = await foClassicLoginPage.getPageTitle(page);
    expect(pageTitle).toContain(foClassicLoginPage.pageTitle);
  });

  test('Upgrade with shop on maintenance : should sign in with default customer', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'sighInFO', baseContext);

    await foClassicLoginPage.customerLogin(page, dataCustomers.johnDoe);

    const isCustomerConnected = await foClassicLoginPage.isCustomerConnected(page);
    expect(isCustomerConnected).toBeTruthy();
  });

  test('Upgrade with shop on maintenance : should add the first product to the cart', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'addProductToCart', baseContext);

    await foClassicLoginPage.goToHomePage(page);

    // Add first product to cart by quick view
    await foClassicHomePage.quickViewProduct(page, 1);
    await foClassicModalQuickViewPage.addToCartByQuickView(page);
    await foClassicModalBlockCartPage.proceedToCheckout(page);

    const pageTitle = await foClassicCartPage.getPageTitle(page);
    expect(pageTitle).toEqual(foClassicCartPage.pageTitle);
  });

  test('Upgrade with shop on maintenance : should proceed to checkout and check Step Address', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkAddressStep', baseContext);

    await foClassicCartPage.clickOnProceedToCheckout(page);

    const isCheckoutPage = await foClassicCheckoutPage.isCheckoutPage(page);
    expect(isCheckoutPage).toBeTruthy();

    const isStepPersonalInformationComplete = await foClassicCheckoutPage.isStepCompleted(
      page,
      foClassicCheckoutPage.personalInformationStepForm,
    );
    expect(isStepPersonalInformationComplete).toBeTruthy();
  });

  test('Upgrade with shop on maintenance : should validate Step Address and go to Delivery Step', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkDeliveryStep', baseContext);

    const isStepAddressComplete = await foClassicCheckoutPage.goToDeliveryStep(page);
    expect(isStepAddressComplete).toBeTruthy();
  });

  test('Upgrade with shop on maintenance : should go to payment step', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToPaymentStep', baseContext);

    const isStepDeliveryComplete = await foClassicCheckoutPage.goToPaymentStep(page);
    expect(isStepDeliveryComplete, 'Step Address is not complete').toBeTruthy();
  });

  test(`Upgrade with shop on maintenance : should check the '${dataModules.psCashOnDelivery.name}' payment module`, async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkPaymentModule', baseContext);

    // Payment step - Choose payment step
    const isVisible = await foClassicCheckoutPage.isPaymentMethodExist(page, dataModules.psCashOnDelivery.tag);
    expect(isVisible).toBeTruthy();
  });

  test('Upgrade with shop on maintenance: should logout', async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'logoutWMaintenance', baseContext);

    // Go back to BO
    page = await foClassicCheckoutPage.closePage(browserContext, page, 0);
    await boModuleManagerPage.logoutBO(page);

    const pageTitle = await boLoginPage.getPageTitle(page);
    expect(pageTitle).toContain(boLoginPage.pageTitle);
  });

  test('Upgrade without shop on maintenance : should uninstall the module', async function () {
    await opsBOModules.uninstallModule(page, dataModules.psCashOnDelivery, `${baseContext}_preTest_0`);
  });

  test('Upgrade without shop on maintenance : should install the module in previous version', async function () {
    await opsBOModules.installModule(page, dataModules.psCashOnDelivery, false, `${baseContext}_preTest_1`);
  });

  test('Upgrade without shop on maintenance : should login in BO', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'loginBO', baseContext);

    await boLoginPage.goTo(page, global.BO.URL);
    await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

    const pageTitle = await boDashboardPage.getPageTitle(page);
    expect(pageTitle).toContain(boDashboardPage.pageTitle);
  });

  test('Upgrade without shop on maintenance : should go to \'Modules > Module Manager\' page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToModuleManagerPageWoMaintenance', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.modulesParentLink,
      boDashboardPage.moduleManagerLink,
    );
    await boModuleManagerPage.closeSfToolBar(page);

    const pageTitle = await boModuleManagerPage.getPageTitle(page);
    expect(pageTitle).toContain(boModuleManagerPage.pageTitle);
  });

  test(`Upgrade without shop on maintenance : should search the module ${dataModules.psCashOnDelivery.name}`, async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'searchModuleWoMaintenance', baseContext);

    const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psCashOnDelivery);
    expect(isModuleVisible).toBeTruthy();

    const moduleInfo = await boModuleManagerPage.getModuleInformationNth(page, 1);
    expect(dataModules.psCashOnDelivery.versionOld).toContain(moduleInfo.version);
  });

  test('Upgrade without shop on maintenance : should upgrade the module', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'upgradeModuleWoMaintenance', baseContext);

    const successMessage = await boModuleManagerPage.setActionInModule(page, dataModules.psCashOnDelivery, 'upgrade', false, true);
    expect(successMessage).toEqual(boModuleManagerPage.updateModuleSuccessMessage(dataModules.psCashOnDelivery.tag));
  });

  test('Upgrade without shop on maintenance : should reload the page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkModuleWoMaintenance', baseContext);

    await boModuleManagerPage.reloadPage(page);

    const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psCashOnDelivery);
    expect(isModuleVisible).toBeTruthy();

    const moduleInfo = await boModuleManagerPage.getModuleInformationNth(page, 1);
    expect(dataModules.psCashOnDelivery.versionCurrent).toContain(moduleInfo.version);
  });

  test('Upgrade without shop on maintenance : should go to the front office', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToTheFoWoMaintenance', baseContext);

    page = await boModuleManagerPage.viewMyShop(page);
    await foClassicHomePage.changeLanguage(page, 'en');

    const isHomePage = await foClassicHomePage.isHomePage(page);
    expect(isHomePage).toBeTruthy();
  });

  test('Upgrade without shop on maintenance : should go to login page', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToLoginPageFOWoMaintenance', baseContext);

    await foClassicHomePage.goToLoginPage(page);

    const pageTitle = await foClassicLoginPage.getPageTitle(page);
    expect(pageTitle).toContain(foClassicLoginPage.pageTitle);
  });

  test('Upgrade without shop on maintenance : should sign in with default customer', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'sighInFOWoMaintenance', baseContext);

    await foClassicLoginPage.customerLogin(page, dataCustomers.johnDoe);

    const isCustomerConnected = await foClassicLoginPage.isCustomerConnected(page);
    expect(isCustomerConnected).toBeTruthy();
  });

  test('Upgrade without shop on maintenance : should add the first product to the cart', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'addProductToCartWoMaintenance', baseContext);

    await foClassicLoginPage.goToHomePage(page);

    // Add first product to cart by quick view
    await foClassicHomePage.quickViewProduct(page, 1);
    await foClassicModalQuickViewPage.addToCartByQuickView(page);
    await foClassicModalBlockCartPage.proceedToCheckout(page);

    const pageTitle = await foClassicCartPage.getPageTitle(page);
    expect(pageTitle).toEqual(foClassicCartPage.pageTitle);
  });

  test('Upgrade without shop on maintenance : should proceed to checkout and check Step Address', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkAddressStepWoMaintenance', baseContext);

    await foClassicCartPage.clickOnProceedToCheckout(page);

    const isCheckoutPage = await foClassicCheckoutPage.isCheckoutPage(page);
    expect(isCheckoutPage).toBeTruthy();

    const isStepPersonalInformationComplete = await foClassicCheckoutPage.isStepCompleted(
      page,
      foClassicCheckoutPage.personalInformationStepForm,
    );
    expect(isStepPersonalInformationComplete).toBeTruthy();
  });

  test('Upgrade without shop on maintenance : should validate Step Address and go to Delivery Step', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkDeliveryStepWoMaintenance', baseContext);

    const isStepAddressComplete = await foClassicCheckoutPage.goToDeliveryStep(page);
    expect(isStepAddressComplete).toBeTruthy();
  });

  test('Upgrade without shop on maintenance : should go to payment step', async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'goToPaymentStepWoMaintenance', baseContext);

    const isStepDeliveryComplete = await foClassicCheckoutPage.goToPaymentStep(page);
    expect(isStepDeliveryComplete, 'Step Address is not complete').toBeTruthy();
  });

  test(`Upgrade without shop on maintenance : should check the '${dataModules.psCashOnDelivery.name}' payment module`, async function () {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'checkPaymentModuleWoMaintenance', baseContext);

    // Payment step - Choose payment step
    const isVisible = await foClassicCheckoutPage.isPaymentMethodExist(page, dataModules.psCashOnDelivery.tag);
    expect(isVisible).toBeTruthy();
  });

  test('Upgrade without shop on maintenance: should logout', async () => {
    await utilsTest.addContextItem(test.info(), 'testIdentifier', 'logoutWoMaintenance', baseContext);

    // Go back to BO
    page = await foClassicCheckoutPage.closePage(browserContext, page, 0);
    await boModuleManagerPage.logoutBO(page);

    const pageTitle = await boLoginPage.getPageTitle(page);
    expect(pageTitle).toContain(boLoginPage.pageTitle);
  });

  test('Upgrade without shop on maintenance : should uninstall the updated module', async function () {
    await opsBOModules.uninstallModule(page, dataModules.psCashOnDelivery, `${baseContext}_postTest_0`);
  });

  test('Upgrade without shop on maintenance : should reset the module to current version', async function () {
    await opsBOModules.installModule(page, dataModules.psCashOnDelivery, process.env.URL_ZIP, `${baseContext}_postTest_1`);
  });
});
