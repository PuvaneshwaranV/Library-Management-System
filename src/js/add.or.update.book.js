
  class BookAddEditModal extends HTMLElement {
    constructor() {
      super();
      const tmpl = $("#book_add_edit_modal").get(0);
      this.appendChild(tmpl.content.cloneNode(true));

      // ---------- Centralized selectors ----------
      this.Selectors = {
        modal: "#book_modal",
        form: "#book_form",
        titleInput: "#lm_book_add_edit_title",
        authorInput: "#author",
        languageSelect: "#language",
        quantityInput: "#quantity",
        modalHeading: ".modal-heading-text",
        saveButton: "#save_btn",
        resetColumn: "#reset_col",
        saveColumn: "#save_col",
        resetButton: "#reset_btn",
        addNewBookBtn: "#add_new_book",
      };

      this.APIURL = "http://localhost:8080/LibraryManagementSystem/Books";

      this.bookId = null;
      this.prevQty = 0;
      
      this.addEditBookValidationRules ={

        title: { required: true, pattern: /^[a-zA-Z][a-zA-Z0-9 ]{1,30}$/  },
        author: { required: true, pattern: /^[a-zA-Z][a-zA-Z ]{1,30}$/ },
        language: { required: true },
        quantity: { required: true, pattern: /^[1-9][0-9]{0,2}$/,  },

      }

      this.addEditBookValidationMessages = {
          title: { required: "Book title is required", pattern:  "Must start with a letter and can contain letters, numbers, or spaces (2-31 characters)",},
          author: { required: "Author name is required", pattern: "Must start with a letter and may contain only letters and spaces (2-31 characters)", },
          language: { required: "Language is required" },
          quantity: { required: "Book quantity is required",pattern: "Book Quantity must between 1-999", }
      }
    }

    connectedCallback() {
      try {
        this.customValidationMethods(); // register rule first
        this.initValidation();
        this.binEventHandlers();
      } catch(error){
        console.log(error);
      }
    }
    
    binEventHandlers(){
      // remove this and use in the datatable init file
      $(document).on("click", this.Selectors.addNewBookBtn, () => this.open());
      $(this).on("click", this.Selectors.saveButton,(e)=> this.saveBookBtnEventAction(e))
    }


    saveBookBtnEventAction(event){
      const form = $(this.Selectors.form);
        if (form.valid()){
          // quantity must not drop below previous when updating
          if (
            this.bookId &&
            parseInt($(this.Selectors.quantityInput).val(), 10) < this.prevQty
          ) {
            form.validate().showErrors({
              quantity: `Not less than ${this.prevQty}`,
            });
            return;
          }
  
          const payload = {
            title: $(this.Selectors.titleInput).val().trim(),
            author: $(this.Selectors.authorInput).val().trim(),
            language: $(this.Selectors.languageSelect).val(),
            totalCount: parseInt(
              $(this.Selectors.quantityInput).val().trim(),
              10
            ),
          };
          const isUpdate = !!this.bookId;
  
          $.ajax({
            url: isUpdate
              ? `${this.APIURL}/updateBookDetails`
              : `${this.APIURL}/addNewBook`,
            type: isUpdate ? "PUT" : "POST",
            data: JSON.stringify(
              isUpdate ? { ...payload, bookId: this.bookId } : payload
            ),
            contentType: "application/json",
            success: () => {
              Swal.fire({
                icon: "success",
                title: isUpdate ? "Book Updated Successfully" : "Book Added Successfully",
                timer: 2000,
                showConfirmButton: false,
              });
              $(this.Selectors.modal).modal("hide");
              this.reset();
              $("#apply_filters").click(); // refresh parent table
            },
            error: (xhr) => {
              const msg = xhr.responseJSON?.message || "Something went wrong.";
              Swal.fire({
                icon: "error",
                title: "Error",
                text: msg,
                timer: 2000,
                showConfirmButton: false,
              });
            },
          });
        }
        

     //   $(this.Selectors.modal).on("hidden.bs.modal", () => this.reset());
        $(this.Selectors.resetButton).on("click", () => this.reset());
    }

    customValidationMethods() {  
      jQuery.validator.addMethod(
        "pattern",
        function (value, element, param) {
          const re = new RegExp(param);
          return this.optional(element) || re.test(value);
        },
        "Invalid format."
      );
    }

    /** Setup jQuery Validate rules + custom methods */
    initValidation() {
      const form = $(this.Selectors.form);
      this.customValidationMethods();
      // if (form.data("validator")) {
      //   form.removeData("validator").removeData("unobtrusiveValidation");
      // }

      form.validate({ ignore: [], onkeyup: false, rules: this.addEditBookValidationRules, messages: this.addEditBookValidationMessages });
    }

    /** Reset fields + clear validation errors */
    reset() {

      this.bookId = null;
      this.prevQty = 0;

      $(this.Selectors.form).trigger("reset");
      if ($(this.Selectors.form).data("validator")) {
        $(this.Selectors.form).validate().resetForm();
      }

      $(this.Selectors.saveButton).text("Save");
      $(this.Selectors.modalHeading).text("Add Book");
      $(this.Selectors.resetColumn).show();
      $(this.Selectors.saveColumn).removeClass("col-3").addClass("col-3");
    }

    /** Opens modal. Accepts data for update or null for add */
    open(data = null) {
      if (data) {
        this.bookId = data.bookId;
        this.prevQty = data.totalCount;
        $(this.Selectors.titleInput).val(data.title);
        $(this.Selectors.authorInput).val(data.author);
        $(this.Selectors.languageSelect).val(data.language.toLowerCase());
        $(this.Selectors.quantityInput).val(data.totalCount);
        $(this.Selectors.saveButton).text("Update");
        $(this.Selectors.modalHeading).text("Update Book");
        $(this.Selectors.resetColumn).hide();
        $(this.Selectors.saveColumn).removeClass("col-3").addClass("col-3");
      } else {
        this.reset();
      }
      $(this.Selectors.modal).modal("show");
    }
  }

  customElements.define("book-add-edit-modal", BookAddEditModal);

