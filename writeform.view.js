TMON.push_write_view = (function(){

    var view = null;
    var versions = null;
    var inputboxLimitSize = 28;
    var textareaLimitSize = 110;
    var isABTest = false;
    var isFileUploaded = false;
    var pushType = '';
    var tablename = ['A','B','C','D','E','F','G','H','I','J'];
    var uploadmanager = null;

    var global = {};

    function isImageUploadForm() {
        switch(pushType) {
            case '':
            case 'home':
            case 'launch':
                return false;
                break;
            default:
                return true;
                break;
        }
    }

    function getObjectByPushType() {
        var o = {
            'landing':'',
            'image':[],
            'local':false
        };

        switch(pushType) {
            case 'dailyDeal':
                o['landing'] = 'deal_detail';
                o['image'] = ['select1','select2','guide1','preview'];
                break;
            case 'dailyCategory':
                o['landing'] = 'daily_category_detail';
                o['image'] = ['select1','form','guide2','preview'];
                break;
            case 'localDeal':
                o['landing'] = 'deal_detail';
                o['image'] = ['select1','select2','guide1','preview'];
                o['local'] = true;
                break;
            case 'localCategory':
                o['landing'] = 'local_category_detail';
                o['image'] = ['select1','form','guide2','preview'];
                o['local'] = true;
                break;
            case 'home':
                o['landing'] = 'home_type';
                break;
            default:
                break;
        }
        return o;
    }

    function makeImageUploadAreaByPushType(context) {

        $('.view', context).each(function(){ $(this).hide() });

        var obj = getObjectByPushType();

        for(var i in obj['image']) {
            if(typeof obj['image'][i] == 'string') {
                $('.'+ obj['image'][i], context).show();
                if(obj['image'][i] == 'select1') {
                    var flagType = $('.img_flag_type', context);
                    flagType.each(function(){ $(this).attr('checked', false); });
                    $(flagType[0]).attr('checked', true);
                }
                if(obj['image'][i] == 'select2') {
                    var imgType = $('.img_type', context);
                    imgType.each(function(){ $(this).attr('checked', false); });
                    $(imgType[0]).attr('checked', true);
                }
            }
        }
    }

    function bindABTestInputValidation(context) {
        $('.message_title input', context).keyup(function(event){
            Util.validateCharLength(event, this, inputboxLimitSize);
        });

        $('.message_summary input', context).keyup(function(event){
            Util.validateCharLength(event, this, inputboxLimitSize);
        });

        $('.message_text_ad textarea', context).keyup(function(event){
            Util.validateCharLength(event, this, textareaLimitSize);
        });

        $('.message_text_ios textarea', context).keyup(function(event){
            Util.validateCharLength(event, this, textareaLimitSize);
        });

        $('.marketing_chanel_ad a', context).click(function(){
            var adContext = $(this).parent();
            LayerUtil.popUp({
                'context': adContext,
                'url':'/mobile/select_launch_path/'+ $('input', adContext).val()
            });
        });

        $('.marketing_chanel_ios a', context).click(function(){
            var iosContext = $(this).parent();
            LayerUtil.popUp({
                'context': iosContext,
                'url':'/mobile/select_launch_path/'+ $('input', iosContext).val()
            });
        });
    }

    return {

        init: function(obj) {
            view = obj['context'];
            versions = obj['version'];

            uploadmanager = new mdlUploadifive();
            uploadmanager.init(obj['imgpath'], obj['session']);

            this.domInitialize();

            if(obj['filename'] != '' && obj['filesize'])
                this.setTextFileUpload(obj['filename'], obj['filesize']);
        },

        domInitialize: function() {
            this.makeTitleForm();
            this.makeSummaryForm();
            this.makeTextForm();
            this.makeMarketingChanelForm();
            this.makeMsgPriorityForm();
        },

        setTextFileUpload: function(file, size) {
            $('.condition', view).val('file_info');
            var context = this.changeTargetCondition('file_info');
            $('textarea', context).val(file+'|'+size+'B|search_result.txt');
            $('.count', context).text('1');

            isFileUploaded = true;
        },

        setGlobalObject: function() {

            var regExp = /^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i;
            global = {};
            global.pushtype = pushType;
            global.pushtypeTitle = '';
            switch(pushType) {
                case 'dailyDeal':
                case 'localDeal':
                    global.pushtypeDetail = LayerUtil.dealInfo.serial;
                    break;
                case 'dailyCategory':
                    global.pushtypeDetail =  $('.daily_category_detail option:selected', view).val();
                    break;
                case 'localCategory':
                    global.pushtypeDetail =  $('.local_category_detail select option:selected', view).val();
                    global.pushtypeTitle = $('.local_category_detail select option:selected', view).text();
                    break;
                case 'home':
                    global.pushtypeDetail =  $('.home_type option:selected', view).val();
                    break;
                default:
                    global.pushtypeDetail =  '0';
                    break;
            }
            global.platform = $('.platform_select option:selected', view).val();

            global.version = [];
            $('.platform_version span',view).each(function(){
                if($(this).is(':visible')) {
                    if($('input', this).is(':checked'))
                        global.version.push($('input', this).val());
                }
            });

            global.abTestCount = $('.ab_test_count select', view).length > 0 ? $('.ab_test_count select', view).val() : 1;
            global.abTest = {
                isUseImg:[],
                imgPath:[],
                imgTitle:[],
                msgTitle:[],
                msgSummary:[],
                msgTxtAd:[],
                msgTxtIos:[],
                mkchAd:[],
                mkchIos:[],
                priority:[]
            };
            if(isABTest) {
                $('.ab_test table', view).each(function(){
                    var imgpath = '', imgtitle = '';
                    if($('.preview_img', this).attr('src')) {
                        imgpath = $('.preview_img', this).attr('src').replace(regExp, '');
                        imgtitle = LayerUtil.dealInfo.title;
                    }
                    global.abTest.isUseImg.push(($('.img_flag_type:checked', this).val() == 'Y'));
                    global.abTest.imgPath.push(imgpath);
                    global.abTest.imgTitle.push(imgtitle);
                    global.abTest.msgTitle.push($('.message_title input', this).val());
                    global.abTest.msgSummary.push($('.message_summary input', this).val());
                    global.abTest.msgTxtAd.push($('.message_text_ad textarea', this).val());
                    global.abTest.msgTxtIos.push($('.message_text_ios textarea', this).val());
                    global.abTest.mkchAd.push($('.marketing_chanel_ad input', this).val());
                    global.abTest.mkchIos.push($('.marketing_chanel_ios input', this).val());
                    global.abTest.priority.push($('.priority select', this).val());
                });
            }
            else {
                var imgpath = '', imgtitle = '';
                if($('.preview_img', view).attr('src')) {
                    imgpath = $('.preview_img', view).attr('src').replace(regExp, '');
                    imgtitle = LayerUtil.dealInfo.title;
                }
                global.abTest.isUseImg.push(($('.img_flag_type:checked', view).val() == 'Y'));
                global.abTest.imgPath.push(imgpath);
                global.abTest.imgTitle.push(imgtitle);
                global.abTest.msgTitle.push($('.message_title input', view).val());
                global.abTest.msgSummary.push($('.message_summary input', view).val());
                global.abTest.msgTxtAd.push($('.message_text_ad textarea', view).val());
                global.abTest.msgTxtIos.push($('.message_text_ios textarea', view).val());
                global.abTest.mkchAd.push($('.marketing_chanel_ad input', view).val());
                global.abTest.mkchIos.push($('.marketing_chanel_ios input', view).val());
                global.abTest.priority.push($('.priority select', view).val());
            }
            global.targetCondition = $('.condition option:selected', view).val();
            global.excel = $('.user_list_detail textarea', view).val();
            global.text = $('.file_info_detail textarea', view).val();
            global.localCategorySrls = [];
            $('.local_tab input[name="local_catsrls[]"]', view).each(function(){
                if($(this).is(':checked'))
                    global.localCategorySrls.push(this.value);
            });
            global.date = $('.datepicker', view).val();

            // 작성중체크.
            global.writing = false;
            for(var i in global.message) {
                var msg = global.message[i];
                if(typeof msg == 'object' &&
                    (msg.img != '' || msg.title != '' || msg.summary != '' || msg.adtxt != '' || msg.iostxt != '')) {
                    global.writing = true;
                    break;
                }
            }

            console.log(global);
        },

        toggleABTestForm: function(val) {

            //this.setGlobalObject();
            //if(global.writing) {
            //    if(confirm('설정한 값이 있을 경우 초기화 됩니다.\n계속 진행 하시겠습니까?')){
            //    } else
            //        return false;
            //}

            isABTest = (val == 'Y');
            if(isABTest) {
                this.removeImageUploadForm();
                this.removeTitleForm();
                this.removeSummaryForm();
                this.removeTextForm();
                this.removeMarketingChanelForm();
                this.removeMsgPriorityForm();
                this.makeABTestCountForm();
                this.makeABTestForm($('.ab_test_count select', view).val());
                if(isImageUploadForm())
                    this.makeImageUploadFormInABTest();
            }
            else {
                this.removeABTestCountForm();
                this.makeTitleForm();
                this.makeSummaryForm();
                this.removeABTestForm();
                this.makeMarketingChanelForm();
                this.makeMsgPriorityForm();
                this.makeTextForm();
                if(isImageUploadForm()) {
                    this.makeImageUploadForm();
                    this.changePushType(pushType);
                }
            }
        },

        changePushType: function(type) {
            if(isFileUploaded) {
                if(type == 'localDeal' || type == 'localCategory') {
                    if(confirm('지역딜, 지역리스트 선택시 기존에 설정한 대상자는 초기화됩니다.')){
                        pushType = type;
                        this.setViewComponentByPushType(true);
                    }
                    else {
                        $('.push_type', view).val(pushType);
                        isFileUploaded = true;
                        return false;
                    }
                }
                else {
                    pushType = type;
                    this.setViewComponentByPushType(false);
                }
            }
            else {
                pushType = type;
                this.setViewComponentByPushType(true);
            }
        },

        setViewComponentByPushType: function(resetTargetCondition) {
            var obj = getObjectByPushType();
            var landingView = $('.landing_page', view).hide();
            $('input', landingView).val('');

            this.removeImageUploadForm();
            if(resetTargetCondition)
                this.removeTargetCondition();

            if(obj['landing'] != '') {
                landingView.show();
                $('div', landingView).each(function(){ $(this).hide(); });
                $('.'+ obj['landing'], landingView).show();
            }

            if(obj['image'].length > 0) {
                if(!isABTest) {
                    var imageUploadView = this.makeImageUploadForm();
                    makeImageUploadAreaByPushType(imageUploadView);
                }
                else
                    this.makeImageUploadFormInABTest();
            }
            else {
                $('.ab_test table', view).each(function(){
                    $('.totalrow', this).attr('rowspan','8');
                });
            }

            if(obj['local']) {
                $('.local_tab', view).show();
                $('.condition', view).val('local_category').attr("disabled", true).children().each(function(){
                    if($(this).val() == 'local_category')
                        $(this).attr('selected', true);
                });
            }
            else {
                $('.local_tab', view).hide();
                if(resetTargetCondition) {
                    $('.condition', view).val('').attr("disabled", false).children().each(function () {
                        $(this).removeAttr('selected');
                    });
                }
            }
        },

        makeImageUploadFormInABTest: function() {
            var self = this;
            $('.ab_test table', view).each(function(){
                $('.totalrow',this).attr('rowspan', '8');
                var context = self.makeImageUploadForm($('.image', this));
                makeImageUploadAreaByPushType(context);
            });
        },

        makeABTestCountForm: function() {
            var txt = '';
            txt += '<tr class="ab_test_count">';
            txt += '    <th>A/B테스트 push개수</th>';
            txt += '    <td colspan="4">';
            txt += '        <select name="ab_test_count">';
            for(var i=2; i<=10; i++) {
                txt += '        <option value="'+ i +'">'+ i +'</option>';
            }
            txt += '        </select>';
            txt += '    </td>';
            txt += '</tr>';

            var self = this;

            $('.ab_test_count', view).show().replaceWith(txt);
            $('.ab_test_count select', view).change(function(){
                self.makeABTestForm(this.value);
            });
        },

        removeABTestCountForm: function() {
            var txt = '<tr class="ab_test_count"></tr>';
            $('.ab_test_count', view).replaceWith(txt).hide();

        },

        makeABTestForm: function(cnt) {
            var txt = '';
            txt += '<table style="margin-bottom: 5px;">';
            txt += '<col width="30"></col>';
            txt += '<col width="160"></col>';
            txt += '<col width="120"></col>';
            txt += '<col width="*"></col>';
            txt += '<tr class="message_title">';
            txt += '    <th class="totalrow" rowspan="7">{{TESTNAME}}</th>';
            txt += '    <th>메세지제목</th>';
            txt += '    <td colspan="4">';
            txt += '        <input type="text" placeholder="메시지 제목을 입력 하세요." style="width:500px"/>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/28(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';
            txt += '<tr class="message_summary">';
            txt += '    <th>메세지요약<br><span style="font-size: 11px; color:red;">(이미지 등록시 필수입력!)</span></th>';
            txt += '    <td colspan="4">';
            txt += '        <input type="text" placeholder="메시지 요약을 입력 하세요." style="width:500px"/>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/28(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';
            txt += '<tr class="image" style="display: none;"></tr>';
            txt += '<tr class="message_text_ad">';
            txt += '    <th rowspan="2">메세지상세</th>';
            txt += '    <th>안드로이드</th>';
            txt += '    <td colspan="3">';
            txt += '        <textarea maxlengtd="110" rows="2" placeholder="상세 메시지 내용을 입력 하세요." style="width:380px;"></textarea>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/110(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';
            txt += '<tr class="message_text_ios">';
            txt += '    <th>아이폰</th>';
            txt += '    <td colspan="3">';
            txt += '        <textarea maxlengtd="110" rows="2" placeholder="상세 메시지 내용을 입력 하세요." style="width:380px;"></textarea>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/110(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';
            txt += '<tr class="marketing_chanel_ad">';
            txt += '    <th rowspan="2">마케팅 광고채널</th>';
            txt += '    <th>안드로이드</th>';
            txt += '    <td colspan="3">';
            txt += '        <input type="text"/>';
            txt += '        <a href="#" class="btn info small">조회</a>';  //jogun
            txt += '    </td>';
            txt += '</tr>';
            txt += '<tr class="marketing_chanel_ios">';
            txt += '    <th>아이폰</th>';
            txt += '    <td colspan="3">';
            txt += '        <input type="text"/>';
            txt += '        <a href="#" class="btn info small">조회</a>';
            txt += '    </td>';
            txt += '</tr>';
            txt += '<tr class="priority">';
            txt += '    <th>메시지우선순위설정<br><span style="font-size: 11px;">(안드로이드)</span></th>';
            txt += '    <td colspan="4">';
            txt += '        <select>';
            txt += '            <option value="default">DEFAULT</option>';
            txt += '            <option value="max">MAX</option>';
            txt += '            <option value="high">HIGH</option>';
            txt += '        </select>';
            txt += '    </td>';
            txt += '</tr>';
            txt += '</table>';

            var context = $('.ab_test', view).show().find('.table');
            context.html('');

            for(var i=0; i<cnt; i++) {

                var html = txt.replace('{{TESTNAME}}', tablename[i]);
                context.append($(html));

                var tableContext = $('table', context)[i];
                bindABTestInputValidation(tableContext);

                if(isImageUploadForm()) {
                    $('.totalrow', tableContext).attr('rowspan', '8');
                    this.makeImageUploadForm($('.image', tableContext));
                    makeImageUploadAreaByPushType(tableContext);
                }

            }
        },

        removeABTestForm: function() {
            $('.ab_test', view).hide().find('.table').html('');
        },

        makeTitleForm: function() {
            var txt = '';
            txt += '<tr class="message_title">';
            txt += '    <th>메시지 제목 </th>';
            txt += '    <td colspan="4" style="padding: 5px 10px">';
            txt += '        <input type="text" placeholder="메시지 제목을 입력 하세요." style="width:500px"/>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/28(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';

            $('.message_title', view).show().replaceWith(txt);
            $('.message_title input', view).keyup(function(event){
                Util.validateCharLength(event, this, inputboxLimitSize);
            });
        },

        removeTitleForm: function() {
            var txt = '<tr class="message_title"></tr>';
            $('.message_title', view).replaceWith(txt).hide();
        },

        makeSummaryForm: function() {
            var txt = '';
            txt += '<tr class="message_summary">';
            txt += '    <th>메시지 요약 <br><span style="font-size: 11px; color:red;">(이미지 등록시 필수입력!)</span></th>';
            txt += '    <td colspan="4" style="padding: 5px 10px">';
            txt += '        <input type="text" placeholder="메시지 요약을 입력 하세요." style="width:500px"/>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/28(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';

            $('.message_summary', view).show().replaceWith(txt);
            $('.message_summary input', view).keyup(function(event){
                Util.validateCharLength(event, this, inputboxLimitSize);
            });
        },

        removeSummaryForm: function() {
            var txt = '<tr class="message_summary"></tr>';
            $('.message_summary', view).replaceWith(txt).hide();
        },

        makeTextForm: function() {
            var txt = '';
            txt += '<tr class="message_text_ad">';
            txt += '    <th rowspan="2">메세지상세</th>';
            txt += '    <th>안드로이드</th>';
            txt += '    <td colspan="3">';
            txt += '        <textarea maxlengtd="110" rows="2" placeholder="상세 메시지 내용을 입력 하세요." style="width:380px;"></textarea>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/110(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';
            txt += '<tr class="message_text_ios">';
            txt += '    <th>아이폰</th>';
            txt += '    <td colspan="3">';
            txt += '        <textarea maxlengtd="110" rows="2" placeholder="상세 메시지 내용을 입력 하세요." style="width:380px;"></textarea>';
            txt += '        <span class="message_length" style="vertical-align:bottom">0/110(byte)</span>';
            txt += '    </td>';
            txt += '</tr>';

            $('.message_text', view).show().replaceWith(txt);
            $('.message_text_ad textarea', view).keyup(function(event){
                Util.validateCharLength(event, this, textareaLimitSize);
            });
            $('.message_text_ios textarea', view).keyup(function(event){
                Util.validateCharLength(event, this, textareaLimitSize);
            });
        },

        removeTextForm: function() {
            var txt = '<tr class="message_text"></tr>';
            $('.message_text_ad', view).replaceWith(txt).hide();
            $('.message_text_ios', view).remove();
        },

        makeMarketingChanelForm: function() {
            var txtAd = '';
            txtAd += '<th rowspan="2">마케팅 광고채널</th>';
            txtAd += '<th>안드로이드</th>';
            txtAd += '<td colspan="3">';
            txtAd += '  <input type="text"/>';
            txtAd += '  <a href="#" class="btn info small">조회</a>';
            txtAd += '</td>';

            var txtIos = '';
            txtIos += '<th>아이폰</th>';
            txtIos += '<td colspan="3">';
            txtIos += ' <input type="text"/>';
            txtIos += ' <a href="#" class="btn info small">조회</a>';
            txtIos += '</td>';

            var adContext = $('.marketing_chanel_ad', view).html(txtAd).show();
            var iosContext = $('.marketing_chanel_ios', view).html(txtIos).show();

            $('a', adContext).click(function(){
                LayerUtil.popUp({
                    'context': adContext,
                    'url':'/mobile/select_launch_path/'+ $('input', adContext).val()
                });
            });

            $('a', iosContext).click(function(){
                LayerUtil.popUp({
                    'context': iosContext,
                    'url':'/mobile/select_launch_path/'+ $('input', iosContext).val()
                });
            });
        },

        removeMarketingChanelForm: function() {
            var txt = '<tr class="marketing_chanel"></tr>';
            $('.marketing_chanel_ad', view).replaceWith(txt).hide();
            $('.marketing_chanel_ios', view).remove();
        },

        makeMsgPriorityForm: function() {
            var txt = '';
            txt += '<tr class="priority">';
            txt += '    <th>메시지우선순위설정 <br><span style="font-size: 11px;">(안드로이드)</span></th>';
            txt += '    <td colspan="4">';
            txt += '        <select>';
            txt += '            <option value="default">DEFAULT</option>';
            txt += '            <option value="max">MAX</option>';
            txt += '            <option value="high">HIGH</option>';
            txt += '        </select>';
            txt += '    </td>';
            txt += '</tr>';

            $('.priority', view).show().replaceWith(txt);
        },

        removeMsgPriorityForm: function() {
            var txt = '<tr class="priority"></tr>';
            $('.priority', view).replaceWith(txt).hide();
        },

        makeImageUploadForm: function(context) {

            var self = this;
            var hashkey = Math.random().toString(36).substr(2);

            var txt = '';
            txt += '<th>이미지</th>'
            txt += '<td colspan="4">'
            txt += '    <div class="view select1" style="margin-bottom: 3px;">';
            txt += '        <span style="margin-right: 20px;"><input type="radio" name="img_flag_type_'+ hashkey +'" class="img_flag_type" value="Y"> 노출</span>';
            txt += '        <span><input type="radio" name="img_flag_type_'+ hashkey +'" class="img_flag_type" value="N" checked="checked"> 미노출</span>';
            txt += '    </div>';
            txt += '    <div class="view select2" style="margin-bottom: 3px; display: none;">';
            txt += '        <span style="margin-right: 20px;"><input type="radio" name="img_type_'+ hashkey +'" class="img_type" value="dealimg" checked="checked"> 딜컨텐츠이미지(카테고리 목록2열)</span>';
            txt += '        <span><input type="radio" name="img_type_'+ hashkey +'" class="img_type" value="img"> 이미지등록</span>';
            txt += '    </div>';
            txt += '    <div class="view form" style="margin-bottom: 3px; display: none;">';
            txt += '        <span class="img_button"><input type="file" id="image_upload_'+ hashkey +'" class="img_file uploadifive-button" /></span>';
            txt += '    </div>';
            txt += '    <div class="view preview" style="display: none;"></div>';
            txt += '    <div class="view guide1" style="display: none;"><span style="color: red;">※ 딜번호 "조회" 버튼을 선택해서 이미지를 등록 해주세요</span></div>';
            txt += '    <div class="view guide2" style="display: none;"><span style="color: red;">※ 권장 이미지 사이즈:466 X 257 &nbsp; ※ 권장 이미지 용량:100kb 미만</span></div>';
            txt += '</td>';

            if(!context) context = $('.image',view);
            context.html(txt).show();

            $('.img_flag_type', context).click(function() {
                if (this.value == 'Y') {
                    makeImageUploadAreaByPushType(context);
                }
                else {
                    $('.select2', context).hide();
                    $('.form', context).hide();
                    $('.preview', context).hide();
                    $('.preview .item', context).remove();
                    $('.guide1', context).hide();
                    $('.guide2', context).hide();

                }
            });

            $('.img_type', context).click(function(){
                if (this.value == 'dealimg') {
                    $('.form', context).hide();
                    $('.preview', context).html('');
                    $('.guide1', context).show();
                    $('.guide2', context).hide();
                }
                else {
                    $('.form', context).show();
                    $('.preview', context).html('');
                    $('.guide1', context).hide();
                    $('.guide2', context).show();
                }
            });

            uploadmanager.uploadImage(context);

            return context;
        },

        removeImageUploadForm: function() {
            var txt = '<tr class="image""></tr>';
            $('.image', view).replaceWith(txt).hide();

        },

        toggleAllVersion: function(checkbox) {
            $('.platform_version input[type=checkbox]', view).each(function(){
                if(!$(this).attr('disabled'))
                    $(this).attr('checked', $(checkbox).is(':checked'));
            });
        },

        checkDeal: function(val) {
            LayerUtil.popUp({
                context:$('.image', view),
                url:'/banner/select_dealdetail/'+ val +'?flag_mobile=Y&select_type=push'
            });
        },

        changePlatform: function(val) {
            var context = $('.platform', view);

            $('input[name^="version"]', context).attr('disabled', true).parent().hide();

            if(val != '') {
                $('.version_message', context).hide();
                $('input[name^="version"][value="all"]', context).attr('disabled', false).parent().show();

                for (var i = 0; i < versions[val].length; i++) {
                    var ver = versions[val][i];
                    if (pushType == 'localCategory') {
                        if (ver >= '2.4.0')
                            $('input[name^="version"][value="' + ver + '"]', context).attr('disabled', false).parent().show();
                    }
                    else if (pushType == 'localDeal') {
                        if (ver >= '2.8.3')
                            $('input[name^="version"][value="' + ver + '"]', context).attr('disabled', false).parent().show();
                    }
                    else
                        $('input[name^="version"][value="' + ver + '"]', context).attr('disabled', false).parent().show();
                }

                if ($('input[name^="version"][value!="all"]:not(:disabled):not(:checked)', context).length == 0)
                    $('input[name^="version"][value="all"]', context).prop('checked', true);
                else
                    $('input[name^="version"][value="all"]', context).prop('checked', false);
            }
            else
                $('.version_message', context).show();
        },

        changeTargetCondition: function(val) {

            var context = $('.target_condition', view);
            var guide = $('.guide_text', context).hide();

            var fileUploadForm = null;
            var txt = '';
            txt += '<input type="file" id="fileupload" class="file uploadifive-button" accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"/>';
            txt += '<textarea style="width:100%; font-size:9px; margin-top:5px;" rows="3" readonly></textarea>';
            txt += '<div style="margin-top: 5px;">';
            txt += '    <span style="margin-right: 10px;">대상 {{TEXT}} 개수 : <span class="count">0</span>개</span>';
            txt += '    <button type="button" class="btn info small">삭제</button>';
            txt += '</div>';

            $('.view', context).each(function(){ $(this).hide(); });

            if(val == 'all') {
                guide.text('※ Push 메시지 수락을 동의한 사용자 전체에게 메시지를 보냅니다.').show();
            }
            else if(val == 'user_list') {
                guide.text('※ xls, xlsx, csv 파일의 업로드가 가능합니다.').show();
                fileUploadForm = $('.user_list_detail', context).html(txt.replace('{{TEXT}}','ID')).show();

                uploadmanager.uploadFile(fileUploadForm, {
                    'type' : 'excel',
                    'desc' : '엑셀 파일 (*.xls; *.xlsx; *.csv)',
                    'ext' : '*.xls; *.xlsx; *.csv',
                    'text' : 'select excel file',
                    'size' : 150
                }, function(){
                    isFileUploaded = true;
                });
            }
            else if(val == 'file_info') {
                guide.text('※ txt 파일의 업로드가 가능합니다.').show();
                fileUploadForm = $('.file_info_detail', context).html(txt.replace('{{TEXT}}','FILE')).show();

                uploadmanager.uploadFile(fileUploadForm, {
                    'type' : 'text',
                    'desc' : 'TEXT 파일 (*.txt)',
                    'ext' : '*.txt',
                    'text' : 'select text file',
                    'size' : 150
                }, function(){
                    isFileUploaded = true;
                });
            }
            else if(val == 'local_category') {
                $('.local_tab', context).show();
            }
            else if(val == 'no_member') {
                guide.text('※ app다운 후 로그인을 한번도 안한 사용자를 대상으로 발송됩니다.').show();
            }

            if(fileUploadForm) {
                $('button', fileUploadForm).click(function(){
                    $('.count', fileUploadForm).text(0);
                    $('textarea', fileUploadForm).val('');
                });
            }

            return fileUploadForm;
        },

        removeTargetCondition: function() {
            $('.guide_text', view).html('').hide();
            $('.file_info_detail', view).html('').hide();
            isFileUploaded = false;
        },

        toggleTargetCategory: function(el) {
            var val = $(el).val();
            $('#cond_local_' + val + ' .cond_' + val).each(function(idx) {
                $(this).attr('checked', $(el).is(':checked'));
            });
        },

        formValidate: function() {

            this.setGlobalObject();

            if(global.pushtype == '') {
                alert('Push종류를 선택해주세요');
                return false;
            }

            var dailyCategoryDetail = $('.daily_category_detail option:selected', view).val();
            var localCategoryDetail = $('.local_category_detail option:selected', view).val();
            var homeType = $('.home_type option:selected', view).val();
            switch(global.pushtype) {
                case 'dailyDeal':     //빅딜
                case 'localDeal':     //지역딜
                    if(global.dealSerial == '') {
                        alert('딜 번호를 선택해주세요.');
                        return false;
                    }
                    break;
                case 'dailyCategory': //기획전
                    if(dailyCategoryDetail == '') {
                        alert('기획전 종류를 선택해주세요.');
                        return false;
                    }
                    break;
                case 'localCategory': //지역카테고리
                    if(localCategoryDetail == '') {
                        alert('지역리스트 타켓을 선택해주세요.');
                        return false;
                    }
                    break;
                case 'home':          //홈
                    if(homeType == ''){
                        alert('티몬홈 종류를 선택해주세요.');
                        return false;
                    }
                    break;
            }

            if(global.platform == '') {
                alert('플랫폼을 선택해주세요.');
                return false;
            }

            if(global.version.length < 1) {
                alert('버전을 선택해주세요.');
                return false;
            }

            for(var i = 0; i< global.abTestCount; i++) {
                if(global.abTest.isUseImg[i] && global.abTest.imgPath[i] == '') {
                    alert('이미지를 입력해주세요.');
                    return false;
                }
                if(global.abTest.msgTitle[i] == '') {
                    alert('메세지 제목을 입력해 주세요.');
                    return false;
                }
                if(global.abTest.isUseImg[i] && global.abTest.msgSummary[i] == '') {
                    alert('메세지 요약을 입력해 주세요.');
                    return false;
                }
                if((global.platform == 'all' || global.platform == 'ad') && global.abTest.msgTxtAd[i] == '') {
                    alert('안드로이드 메세지를 입력해주세요.');
                    return false;
                }
                if((global.platform == 'all' || global.platform == 'ios') && global.abTest.msgTxtIos[i] == '') {
                    alert('아이폰 메세지를 입력해주세요.');
                    return false;
                }
            }

            if(global.targetCondition == '') {
                alert('발송대상자를 선택해주세요.');
                return false;
            }

            switch(global.targetCondition){
                case 'user_list':
                    if(global.excel == '') {
                        alert('엑셀파일을 업로드 해야 합니다.');
                        return false;
                    }
                    break;
                case 'file_info':
                    if(global.text == '') {
                        alert('TEXT파일을 업로드 해야 합니다.');
                        return false;
                    }
                    break;
                case 'local_category':
                    if(global.localCategorySrls.length < 1) {
                        alert('지역을 선택해 주세요.');
                        return false;
                    }
                    break;
            }

            if(global.date == '') {
                alert('발송예정일을 입력해 주세요.');
                return;
            }

            return true;
        },

        doSubmit: function() {

            if(!this.formValidate())
                return;

            var version = '';
            for(var i in global.version) {
                if(typeof global.version[i] == 'string') {
                    version += global.version[i];
                    if(global.version[i] == 'all')
                        break;
                    if(i < global.version.length - 1)
                        version += '|';
                }
            }

            var member = '';
            for(var i in global.localCategorySrls) {
                if(typeof global.localCategorySrls[i] == 'string'){
                    member += global.localCategorySrls[i];
                    if(i < global.localCategorySrls.length - 1)
                        member += '|';
                }
            }

            var str = '';
            str += 'pushType='+ global.pushtype + '&pushTypeDetail='+ global.pushtypeDetail;
            str += '&pushTypeTitle='+ global.pushtypeTitle;

            str += '&abTestCount='+ global.abTestCount;
            str += '&imgPath='+ global.abTest.imgPath +'&imgTitle='+ global.abTest.imgTitle;
            str += '&msgTitle='+ global.abTest.msgTitle +'&msgSummary='+ global.abTest.msgSummary;
            str += '&msgTxtAd='+ global.abTest.msgTxtAd +'&msgTxtIos='+ global.abTest.msgTxtIos;
            str += '&mkchAd='+ global.abTest.mkchAd +'&mkchIos='+ global.abTest.mkchIos;
            str += '&priority='+ global.abTest.priority;
            str += '&scheduledDate='+ global.date;

            str += '&platform='+ global.platform +'&version='+ version +'&memberSrl='+ member;
            str += '&condition='+ global.targetCondition;
            if(global.targetCondition == 'user_list')
                str += '&file='+ global.excel;
            else if(global.targetCondition == 'file_info')
                str += '&file='+ global.text;

            $.ajax({
                type:'post',
                data:str,
                dataType: 'json',
                url:'/mobile/push_create_action',
                success: function (data, stat, xhr) {
                    alert('등록되었습니다.');
                    window.location.href = '/mobile/push';
                },
                fail: function (xhr, stat, err) {
                    alert(err.message);
                }
            });
        }
    }
});

var mdlUploadifive = (function(){

    var imagepath = '';
    var sessionId = '';
    var limitFileSize = 1048576;

    return {

        init: function(_path, _session) {
            imagepath = _path;
            sessionId = _session;
        },

        isValidType: function(type) {
            var isValidType = false;;
            switch(type) {
                case 'image/jpeg':
                case 'image/png':
                case 'image/gif':
                case 'image/jpg':
                    isValidType = true;
                    break;
            }
            return isValidType;
        },

        showUploadedImage: function(filename, context) {
            if (!filename)
                return;

            var self = this;
            var html = '<div class="item"><img class="preview_img" src="' + imagepath + filename + '" /> <span class="button normal red"><input type="button" class="delete" value="삭제" /></span></div>';
            var preview = $('.preview', context).append($(html));

            $('.delete', preview).click(function () {
                if (confirm('정말 삭제 할까요?'))
                    self.deleteImage(filename, $(this).parents('.item'));
            });
        },

        deleteImage: function(image, view) {
            $.get("/mobile/removeImage/mbanner?rule=eBanner&type=org&image="+image, function(data){
                if (data == 'failed') {
                    alert(image + ' 파일 삭제 실패! 다시 시도해보세요');
                } else {
                    view.remove();
                }
            });
        },

        uploadImage: function(context) {

            var self = this;
            $('.img_file', context) .uploadifive({
                'uploadScript' : '/mobile/uploadImage/banner?img_rule=banner',
                'cancelImg' : '/static/uploadifive-v.1.1.1/uploadifive-cancel.png',
                'removeCompleted': true,
                'scriptData' : { 'PHPSESSID': sessionId },
                'fileDesc' : 'Images (*.jpg; *.gif; *.png)',
                'fileExt' : '*.jpg; *.gif; *.png',
                'sizeLimit' : limitFileSize,
                'auto': true,
                'onCancel' : function(){
                },
                'onAddQueueItem' : function(fileObj) {
                    if(!self.isValidType(fileObj.type)) {
                        alert('이미지 파일(JPG,GIF,PNG)만 업로드 해주세요.');
                        return;
                    }

                    if (fileObj.size >= limitFileSize) {
                        alert(fileObj.name +' '+ '파일 사이즈가 1 MB 를 넘습니다.\n파일 사이즈가 크면 로딩될때 오래걸릴 수 있습니다.\n되도록이면 1 MB 이하로 올려주세요.');
                        return;
                    }
                },
                'onUploadComplete' : function(fildObj, data) {
                    if (data == 'notValid'){
                        alert('잘못된 이미지 파일입니다. 정상적인 이미지파일을 올려주세요.');
                    }
                    else if (!data){
                        alert('파일 업로드를 실패했습니다! 다시 시도해보세요');
                    }
                    else{
                        self.showUploadedImage(data, context);
                    }
                }
            });
        },

        uploadFile: function(context, obj, success) {
            $('.file', context).uploadifive({
                'uploadScript': '/mobile/push_upload_'+ obj['type'],
                'cancelImg' : '/static/uploadifive-v.1.1.1/uploadifive-cancel.png',
                'removeCompleted': true,
                'scriptData' : { 'PHPSESSID': sessionId },
                'fileDesc': obj['desc'],
                'fileExt': obj['ext'],
                'auto': true,
                'buttonText': obj['text'],
                'width': obj['size'],
                'fileSizeLimit': 0,
                'onCancel' : function(){
                },
                'onAddQueueItem' : function(fileObj) {
                },
                'onUploadComplete': function(fileObj, data) {
                    var resp_obj = $.parseJSON(data);
                    alert(resp_obj.message);
                    if (!resp_obj.success)
                        return;

                    var result = obj['type'] == 'excel' ? resp_obj.user_list : resp_obj.file_info;
                    var count = obj['type'] == 'excel' ? $.number_format(result.length) : $.number_format(1);
                    $('textarea', context).val(result.join('|'));
                    $('.count', context).text(count);

                    success();
                }
            });
        }
    }
});

var Util = (function(){
    return {
        checkBytes: function(str) {
            var len = 0;
            for (var i=0;i<str.length;i++) {
                len += (str.charCodeAt(i) > 128)?2:1;
            }
            return len;
        },

        fn_substring: function(str, start, size) {
            var lim = 0;
            var len = Util.checkBytes(str);

            for (var i=start; i<len; i++) {
                lim += (str.charCodeAt(i) > 128)?2:1;
                if (lim >size)
                    return str.substring(0,i);
            }
        },

        validateCharLength: function(event, input, limit) {
            var val = $.trim($(input).val());
            var len = Util.checkBytes(val);

            $('.message_length', $(input).parent()).text(len + '/'+ limit +'(byte)');

            if (len > limit && event.keyCode != 8) {
                alert('최대 '+ limit/2 +'자('+ limit +'byte) 입력 가능합니다.');

                //초과글 삭제
                var new_text = Util.fn_substring(val, 0, limit);
                $(input).val(new_text);
                $('.message_length', $(input).parent()).text(limit + '/'+ limit);
                return;
            }
        }
    }
})();

var LayerUtil = (function(){

    var context = null;

    return {

        dealInfo:{
            serial:0,
            title:''
        },

        popUp: function(obj) {
            if(!obj.url || !obj.context)
                return;

            context = obj.context;

            $.fancybox({
                type: 'iframe',
                autoDimensions: false,
                width: !obj.width? 600 : obj.width,
                height: !obj.height? 600 : obj.height,
                href: obj.url
            });
            return false;
        },

        receiveLaunchPath: function(path) {
            $('input', context).val(path);
            context = null;

            $.fancybox.close();
        },

        receiveDealDetail: function(serial, title, text, period, path) {

            this.dealInfo.serial = serial;
            this.dealInfo.title = title;

            var txt = '<div class="item"><img class="preview_img" src="'+ path +'"/></div>';

            $(context).each(function(){
                if($('.img_type:checked', this).val() == 'dealimg') {
                    $('.form', this).hide();
                    $('.preview', this).html(txt).show();
                }
            });

            context = null;

            $.fancybox.close();
        }
    }
})();