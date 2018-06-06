// Add your javascript here
$(function(){
  var widget = $("#invoice-calculator-widget");
  
  var payment_term_control = widget.find(".payment_term_control").first();

  var invoice_amount_control = widget.find(".invoice_amount_control").first();
  var invoice_amount_unit_control = widget.find(".invoice_amount_unit_control").first();
  var fees_amount_control = widget.find(".fees_amount_control").first();
  var cash_amount_control = widget.find(".cash_amount_control").first();

  
  var payment_term = widget.find("[name='payment_term']");
  var invoice_amount = widget.find("[name='invoice_amount']").first();
  var invoice_amount_unit = widget.find("[name='invoice_amount_unit']");
  var fees_amount = widget.find("[name='fees_amount']").first();
  var cash_amount = widget.find("[name='cash_amount']").first();
  
  var payment_term_error = payment_term_control.find(".error").first();
  var invoice_amount_error = invoice_amount_control.find(".error").first();
  var invoice_amount_unit_error = invoice_amount_unit_control.find(".error").first();

  
  var render = debounce(update, 100);
  
  payment_term.on('change',render);
  invoice_amount.on('change',render);
  invoice_amount.on('keydown',render);
  invoice_amount_unit.on('change',render);


  widget.find('.amount').on('keyup keypress blur change', function(event){
    var value = event.target.value;
    var original_value = currencyParser(value);
    var formatted_value = currencyFormatter(original_value)
    event.target.value = formatted_value;
  })

  
  render();

  function update(){
    
    payment_term_value = payment_term.filter(":checked").first();
    invoice_amount_unit_value = invoice_amount_unit.filter(":checked").first();
    invoice_amount_value = invoice_amount;
    
    if(!payment_term_value.val()){
      payment_term_error.addClass("has-error");
      payment_term_error.html("Please select payment term.");
    }else{
      payment_term_error.removeClass("has-error");
      payment_term_error.html("");
    }
    
    var invoice_amount_valid = true;
    var invoice_amount_val = currencyParser(invoice_amount_value.val());
    
    if(!invoice_amount_val){
      invoice_amount_valid = false;
      invoice_amount_error.addClass("has-error");
      invoice_amount_error.html("Please enter amount.");
    }else{
      if( invoice_amount_val>10000 ){
        invoice_amount_valid = false;
        invoice_amount_error.addClass("has-error");
        invoice_amount_error.html("Amount should be less than 10000.");
      }else if( invoice_amount_val<0 ){
        invoice_amount_valid = false;
        invoice_amount_error.addClass("has-error");
        invoice_amount_error.html("Amount should be positive.");
      }else{
        invoice_amount_error.removeClass("has-error");
        invoice_amount_error.html("");
      }
    }
    
    if(!invoice_amount_unit_value.val()){
      invoice_amount_unit_error.addClass("has-error");
      invoice_amount_unit_error.html("Please select amount in.");
    }else{
      invoice_amount_unit_error.removeClass("has-error");
      invoice_amount_unit_error.html("");
    }
    
    
    if(invoice_amount_valid && payment_term_value.val() && invoice_amount_val && invoice_amount_unit_value.val()){
        var payment_term_val = parseInt(payment_term_value.val());
        var invoice_amount_unit_val = invoice_amount_unit_value.val();
        
        if(invoice_amount_unit_val === "lacs"){
          invoice_amount_val = invoice_amount_val * 100000;
        }
        else if(invoice_amount_unit_val === "crores"){
          invoice_amount_val = invoice_amount_val * 10000000;
        }
        
        var fees_amount_val = invoice_amount_val * 0.001;
        var cash_amount_val = invoice_amount_val * 0.8;
        
        fees_amount.html(formatINR(fees_amount_val.toFixed(2)));
        cash_amount.html(formatINR(cash_amount_val.toFixed(2)));
      
    }else{
      fees_amount.html('₹ 0');
      cash_amount.html('₹ 0');
    }
  }
  
  
  function formatINR(num) {
    var n1, n2;
    num = num + '' || '';
    n1 = num.split('.');
    n2 = n1[1] || null;
    n1 = n1[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
    num = n2 ? n1 + '.' + n2 : n1;
    return "₹ "+num;
  }

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate) {
  	var timeout;
  	return function() {
  		var context = this, args = arguments;
  		var later = function() {
  			timeout = null;
  			if (!immediate) func.apply(context, args);
  		};
  		var callNow = immediate && !timeout;
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait);
  		if (callNow) func.apply(context, args);
  	};
  };
  
  
  function currencyFormatter(value){
        let rawValue = "" + value;
        let formattedValue = '';
        if (rawValue != '' && rawValue != null && !isNaN(rawValue) && isFinite(rawValue)) {

            const parts = rawValue.split(".")

            if (parts.length >= 1) {
                const digits = parts[0].split("").reverse()
                const formattedDigits = [];
                for (let i = 0; i < digits.length; i++) {
                    if (i == 3) {
                        formattedDigits.push(",");
                    } else if (i > 3 && i % 2 === 1) {
                        formattedDigits.push(",");
                    }
                    formattedDigits.push(digits[i]);
                }
                formattedDigits.reverse();
                formattedValue = formattedDigits.join("")
            }
            if (parts.length >= 2) {
                formattedValue += "." + parts[1]
            }

            return '₹ '+formattedValue;
        }
        return formattedValue;
    }
    function currencyParser(formattedValue){

        let processedValue = formattedValue;

        if (formattedValue && typeof formattedValue === "string") {
            formattedValue = formattedValue.replace("₹ ", '');

            if(formattedValue !== "0"){
              formattedValue = formattedValue.replace(/^0+/, '');
            }
            
            const parts = formattedValue.split(".");
            const hasDecimal = /\./.test(formattedValue);

            if (parts.length == 1) {
                processedValue = formattedValue.replace(/\D+/g, "") + (hasDecimal ? "." : "");
            }
            else if (parts.length > 1) {
                const abscissa = parts[0].replace(/\D+/g, "");
                const mantissa = parts[1].replace(/\D+/g, "");
                processedValue = abscissa + "." + mantissa.substr(0, Math.min(2, mantissa.length));
            }

        }
        const matches = /^\d+(\.\d*)?/.exec(processedValue);
        if (matches && matches.length > 0) {
            processedValue = matches[0]
        } else {
            processedValue = '';
        }
        return processedValue;
    }
  
});