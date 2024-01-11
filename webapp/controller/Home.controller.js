sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/Button",
    "sap/m/Text"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, Filter, MessageToast, FilterOperator, Dialog, mobileLibrary, Button, Text) {
        "use strict";
        var that, oGModel;
        var ButtonType = mobileLibrary.ButtonType;
        var DialogType = mobileLibrary.DialogType;
        return Controller.extend("cpapp.vcplocprodchar.controller.Home", {
            onInit: function () {
                that = this;
                that.oGModel = this.getOwnerComponent().getModel("oGModel");
                that.oTabtModel = new JSONModel();
                that.oCharModel = new JSONModel();
                that.oCharModel.setSizeLimit(5000);
                that.oAlgoListModel = new JSONModel();
                this.locModel = new JSONModel();
                this.locModel.setSizeLimit(2000);
                this.prodModel = new JSONModel();
                this.prodModel.setSizeLimit(2000);
                that.oCharModel1 = new JSONModel();
                that.oCharModel1.setSizeLimit(5000);
            },
            onAfterRendering: function () {
                sap.ui.core.BusyIndicator.show();
                that.loadArray = [];
                // Declaring fragments
                this._oCore = sap.ui.getCore();
                if (!this._valueHelpDialogLoc) {
                    this._valueHelpDialogLoc = sap.ui.xmlfragment(
                        "cpapp.vcplocprodchar.view.LocDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogLoc);
                }
                if (!this._valueHelpDialogProd) {
                    this._valueHelpDialogProd = sap.ui.xmlfragment(
                        "cpapp.vcplocprodchar.view.ProdDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProd);
                }
                this.oProductList = this._oCore.byId(
                    this._valueHelpDialogProd.getId() + "-list"
                );
                this.oLocList = this._oCore.byId(
                    this._valueHelpDialogLoc.getId() + "-list"
                );

                that.oLoc = this.byId("PDFlocInput");
                that.oProd = this.byId("PDFprodInput");

                // this.getOwnerComponent().getModel("BModel").callFunction("/getProductCharVal", {
                //     method: "GET",
                //     urlParameters: {
                //         Flag: "Z",
                //         PRODATA: JSON.stringify([])
                //     },
                    this.getOwnerComponent().getModel("BModel").read("/getProdClsCharMaster", {
                    success: function (oData) {
                        that.allCharacterstics = [];
                        for (let i = 0; i < oData.results.length; i++) {
                            that.loadArray.push(oData.results[i]);
                        }
                        let aDistinct = that.removeDuplicate(that.loadArray, 'CHAR_NAME');
                        that.allCharacterstics = that.loadArray;
                    },
                    error: function () {
                        MessageToast.show("Failed to get profiles");
                    },
                });
                this.getOwnerComponent().getModel("BModel").read("/getLocation", {
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that.LocData = oData.results;
                        that.locModel.setData({
                            Locitems: that.LocData
                        });
                        that.oLocList.setModel(that.locModel);
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("error");
                    },
                });
            },
            removeDuplicate(array, key) {
                var check = new Set();
                return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
            },
            handleValueHelp: function (oEvent) {
                var sId = oEvent.getSource().getId();
                if (sId.includes("PDFlocInput")) {
                    that._valueHelpDialogLoc.open();
                }
                else if (sId.includes("PDFprodInput")) {
                    if (this.byId("PDFlocInput").getValue()) {
                        that._valueHelpDialogProd.open();
                    }
                    else {
                        MessageToast.show("Select Location");
                    }
                }

            },
            handleSearch: function (oEvent) {
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                // Product
                if (sId.includes("Loc")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                                    new Filter(
                                        "LOCATION_DESC",
                                        FilterOperator.Contains,
                                        sQuery
                                    ),
                                ],
                                and: false,
                            })
                        );
                    }
                    that.oLocList.getBinding("items").filter(oFilters);
                    // Product
                } else if (sId.includes("prod")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                    new Filter("PROD_DESC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    that.oProductList.getBinding("items").filter(oFilters);
                }
            },
            handleSearch1: function (oEvent) {
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                if (sId.includes("headtabSearch")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("CHAR_NUM", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_DESC", FilterOperator.Contains, sQuery) 
                                ],
                                and: false,
                            })
                        );
                    }
                    that.byId("idChars").getBinding("items").filter(oFilters);
                }
            },
            handleSelection: function (oEvent) {
                var SID = oEvent.getSource().getId();
                if (SID.includes("LocSlctListJS")) {
                    that.oCharModel1.setData({ setChars: [] });
                    that.byId("idChars").setModel(that.oCharModel1);
                    that.oProd.removeAllTokens();
                    var aSelectedLoc = oEvent.getParameter("selectedItems");
                    that.oLoc.setValue(aSelectedLoc[0].getTitle());
                    that.getOwnerComponent().getModel("BModel").read("/getLocProdDet", {
                        filters: [
                            new Filter(
                                "LOCATION_ID",
                                FilterOperator.EQ,
                                that.oLoc.getValue()
                            ),
                        ],
                        success: function (oData) {
                            that.prodData = oData.results;
                            that.prodModel.setData({ prodDetails: that.prodData });
                            that.oProductList.setModel(that.prodModel);
                            that.byId("PDFprodInput").setEnabled(true);
                        },
                        error: function (oData, error) {
                            MessageToast.show("error");
                        },
                    });
                }
                else if (SID.includes("prodSlctListJS")) {
                    that.oCharModel1.setData({ setChars: [] });
                    that.byId("idChars").setModel(that.oCharModel1);
                    var aSelectedProd;
                    aSelectedProd = oEvent.getParameter("selectedItems");
                    that.oProd.removeAllTokens();
                    aSelectedProd.forEach(function (oItem) {
                        that.oProd.addToken(
                            new sap.m.Token({
                                key: oItem.getTitle(),
                                text: oItem.getTitle(),
                                editable: false,

                            })
                        );
                    });
                }
            },
            onCancelPress: function () {
                that.oLoc.setValue();
                that.oProd.removeAllTokens();
                that.oCharModel1.setData({ setChars: [] });
                that.byId("idChars").setModel(that.oCharModel1);
                that.byId("headtabSearch").setValue();
                that.byId("idCharSaveBtn").setEnabled(false);
            },
            onSubmitPress: function () {
                sap.ui.core.BusyIndicator.show();
                var table = that.byId("idChars");
                var selectedLoc = that.byId("PDFlocInput").getValue();
                var selectedProd1 = that.byId("PDFprodInput").getTokens()[0];
                if (
                    selectedLoc !== undefined &&
                    selectedLoc !== "" &&
                    selectedProd1 !== undefined &&
                    selectedProd1 !== "") {
                    that.byId("idCharSaveBtn").setEnabled(true);
                    var selectedProd = that.byId("PDFprodInput").getTokens()[0].getText();
                    var selectedLoc = that.byId("PDFlocInput").getValue();
                    that.allCharacterstics1 = that.allCharacterstics.filter(a => a.PRODUCT_ID === selectedProd);
                    if(that.allCharacterstics1.length>0){
                    that.oCharModel1.setData({ setChars: that.allCharacterstics1 });
                    table.setModel(that.oCharModel1);
                    table.removeSelections();
                    that.getOwnerComponent().getModel("BModel").read("/getLocProdChars", {
                        filters: [
                            new Filter(
                                "LOCATION_ID",
                                FilterOperator.EQ,
                                selectedLoc
                            ),
                            new Filter(
                                "PRODUCT_ID",
                                FilterOperator.EQ,
                                selectedProd
                            )
                        ],
                        success: function (oData) {
                            that.selectedChars = [];
                            if (oData.results.length > 0) {
                                that.selectedChars = oData.results;
                                var tableItems = table.getItems();
                                for (var k = 0; k < tableItems.length; k++) {
                                    for (var s = 0; s < that.selectedChars.length; s++) {
                                        if (that.selectedChars[s].CHAR_NUM === tableItems[k].getCells()[0].getText()
                                            && that.selectedChars[s].CHAR_VALUE === tableItems[k].getCells()[1].getText()
                                            && that.selectedChars[s].LOCATION_ID === selectedLoc
                                            && that.selectedChars[s].PRODUCT_ID === selectedProd) {
                                            tableItems[k].setSelected(true);
                                        }
                                    }
                                }
                            }
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function (oData, error) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("error");
                        },
                    });

                }
                else{
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("No characteristics for selected Location/Product");
                }
            }
                else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Please Select Location/Configurable Product");
                }
           
            },
            onTableItemsSelect: function (oEvent) {
                var oEntry = {};
                sap.ui.core.BusyIndicator.show();
                if(oEvent.getParameter("selectAll")){
                    that.fullChars = that.allCharacterstics1;
                    that.selectedChars=[];
                    for(var i=0;i<that.allCharacterstics1.length;i++){
                        oEntry = {
                            LOCATION_ID: that.byId("PDFlocInput").getValue(),
                            PRODUCT_ID: that.byId("PDFprodInput").getTokens()[0].getText(),
                            CHAR_NUM: that.allCharacterstics1[i].CHAR_NUM,
                            CHAR_DESC: that.allCharacterstics1[i].CHAR_DESC,
                            CHARVAL_DESC: that.allCharacterstics1[i].CHARVAL_DESC,
                            CHAR_VALUE: that.allCharacterstics1[i].CHAR_VALUE,
                            CHARVAL_NUM: that.allCharacterstics1[i].CHARVAL_NUM
                        }
                        that.selectedChars.push(oEntry);
                    }
                    sap.ui.core.BusyIndicator.hide();
                }
                else{
                var selected = oEvent.getParameters().selected;                
                if (selected) {
                    oEntry = {
                        LOCATION_ID: that.byId("PDFlocInput").getValue(),
                        PRODUCT_ID: that.byId("PDFprodInput").getTokens()[0].getText(),
                        CHAR_NUM: oEvent.getParameters().listItem.getCells()[0].getText(),
                        CHAR_DESC: oEvent.getParameters().listItem.getCells()[0].getTitle(),
                        CHARVAL_DESC: oEvent.getParameters().listItem.getCells()[1].getTitle(),
                        CHAR_VALUE: oEvent.getParameters().listItem.getCells()[1].getText(),
                        CHARVAL_NUM: oEvent.getParameters().listItem.getCells()[2].getText()
                    }
                    that.selectedChars.push(oEntry);
                    sap.ui.core.BusyIndicator.hide();
                }
                else {
                    var unSelectAll = oEvent.getParameters().listItems;
                    if(unSelectAll.length === that.allCharacterstics1.length){
                        that.selectedChars=[];
                    }
                    else{
                    var selectedId = oEvent.getParameters().listItem.getCells()[0].getText();
                    that.selectedChars = removeElementById(that.selectedChars, selectedId);
                    function removeElementById(array, idToRemove) {
                        return array.filter(function (obj) {
                            return obj.CHAR_NUM !== idToRemove;
                        });
                    }
                }
                    sap.ui.core.BusyIndicator.hide();
                }
            }
            },
            onCharSavePress: function () {
                sap.ui.core.BusyIndicator.show();
                that.byId("headtabSearch").setValue();
                that.byId("idChars").getBinding("items").filter([]);
                var charItems = {}, charArray = [];
                var selectedItems = that.byId("idChars").getSelectedItems();
                var selectedLocation = that.byId("PDFlocInput").getValue();
                var selectedProduct = that.byId("PDFprodInput").getTokens()[0].getText();
                if (that.selectedChars.length > 0) {
                    for (var i = 0; i < that.selectedChars.length; i++) {
                        charItems.LOCATION_ID = selectedLocation;
                        charItems.PRODUCT_ID = selectedProduct;
                        charItems.CHAR_NUM = that.selectedChars[i].CHAR_NUM;
                        charItems.CHAR_DESC = that.selectedChars[i].CHAR_DESC;
                        charItems.CHAR_VALUE = that.selectedChars[i].CHAR_VALUE;
                        charItems.CHARVAL_DESC = that.selectedChars[i].CHARVAL_DESC;
                        charItems.CHARVAL_NUM = that.selectedChars[i].CHARVAL_NUM;
                        charArray.push(charItems);
                        charItems = {};
                    }
                    var flag = "X";

                }
                else {
                    charItems.LOCATION_ID = selectedLocation;
                    charItems.PRODUCT_ID = selectedProduct;
                    charArray.push(charItems);
                    var flag = "D"
                }
                var stringData = JSON.stringify(charArray);
                this.getOwnerComponent().getModel("BModel").callFunction("/getLOCPRODCHAR", {
                    method: "GET",
                    urlParameters: {
                        FLAG: flag,
                        LOCPRODCHAR: stringData
                    },
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show(oData.getLOCPRODCHAR);
                        that.selectedChars=[];
                        that.onSubmitPress();
                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("error");
                    },
                });
            },
            onNavPress: function () {
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    jQuery.sap.storage(jQuery.sap.storage.Type.local).put("data", 0);
                    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                    // generate the Hash to display
                    var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                        target: {
                            semanticObject: "VCPDocument",
                            action: "Display"
                        }
                    })) || "";
                    //Generate a  URL for the second application
                    var url = window.location.href.split('#')[0] + hash;
                    // //Navigate to second app
                    sap.m.URLHelper.redirect(url, true);
                }
            }
        });
    });
