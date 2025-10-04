
  class BookAddEditModal extends HTMLElement {
    constructor() {
      super();
      const tmpl = $("#book_add_edit_modal").get(0);
      this.appendChild(tmpl.content.cloneNode(true));

      // ---------- Centralized selectors ----------
      this.Selectors = {
        modal: "#book_modal",
        form: "#book_form",
        lmBookAddEditTitle: "#lm_book_add_edit_title",
        lmBookAddEditAuthor: "#lm_book_add_edit_author",
        lmBookAddEditLanguage: "#lm_book_add_edit_language",
        lmBookAddEditQuantity: "#lm_book_add_edit_quantity",
        lmBookAddEdit: ".lm-book-add-edit-modal-heading-text",
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

        lm_book_add_edit_title: { required: true, pattern: /^[a-zA-Z][a-zA-Z0-9 ]{1,30}$/  },
        lm_book_add_edit_author: { required: true, pattern: /^[a-zA-Z][a-zA-Z ]{1,30}$/ },
        lm_book_add_edit_language: { required: true },
        lm_book_add_edit_quantity: { required: true, pattern: /^[1-9][0-9]{0,2}$/,  },

      }

      this.addEditBookValidationMessages = {
          lm_book_add_edit_title: { required: "Book title is required", pattern:  "Must start with a letter and can contain letters, numbers, or spaces (2-31 characters)",},
          lm_book_add_edit_author: { required: "Author name is required", pattern: "Must start with a letter and may contain only letters and spaces (2-31 characters)", },
          lm_book_add_edit_language: { required: "Language is required" },
          lm_book_add_edit_quantity: { required: "Book quantity is required",pattern: "Book Quantity must between 1-999", }
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
            parseInt($(this.Selectors.lmBookAddEditQuantity).val(), 10) < this.prevQty
          ) {
            form.validate().showErrors({
              quantity: `Not less than ${this.prevQty}`,
            });
            return;
          }
  
          const payload = {
            title: $(this.Selectors.lmBookAddEditTitle).val().trim(),
            author: $(this.Selectors.lmBookAddEditAuthor).val().trim(),
            language: $(this.Selectors.lmBookAddEditLanguage).val(),
            totalCount: parseInt(
              $(this.Selectors.lmBookAddEditQuantity).val().trim(),
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
      $(this.Selectors.lmBookAddEdit).text("Add Book");
      $(this.Selectors.resetColumn).show();
     
    }

    /** Opens modal. Accepts data for update or null for add */
    open(data = null) {
      if (data) {
        this.bookId = data.bookId;
        if ($(this.Selectors.form).data("validator")) {
          $(this.Selectors.form).validate().resetForm();
        }
        this.prevQty = data.totalCount;
        $(this.Selectors.lmBookAddEditTitle).val(data.title);
        $(this.Selectors.lmBookAddEditAuthor).val(data.author);
        $(this.Selectors.lmBookAddEditLanguage).val(data.language.toLowerCase());
        $(this.Selectors.lmBookAddEditQuantity).val(data.totalCount);
        $(this.Selectors.saveButton).text("Update");
        $(this.Selectors.lmBookAddEdit).text("Update Book");
        $(this.Selectors.resetColumn).show();
       
      } else {
        this.reset();
      }
      $(this.Selectors.modal).modal("show");
    }
  }

  customElements.define("book-add-edit-modal", BookAddEditModal);

