if (!customElements.get("book-add-edit-modal")) {
  class BookAddEditModal extends HTMLElement {
    constructor() {
      super();
      const tmpl = $("#book_add_edit_modal").get(0);
      this.appendChild(tmpl.content.cloneNode(true));

      // ---------- Centralized selectors ----------
      this.selectors = {
        modal: "#book_modal",
        form: "#book_form",
        titleInput: "#title",
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

      this.apiUrl = "http://localhost:8080/LibraryManagementSystem/Books";

      this.bookId = null;
      this.prevQty = 0;
    }

    connectedCallback() {
      this.attachEvents();
      $(document).on("click", this.selectors.addNewBookBtn, () => this.open());
    }

    /** All event bindings */
    attachEvents() {
      this.initValidation();
      
      // --------- Save Button ----------
      $(this.selectors.saveButton).on("click", () => {
        const form = $(this.selectors.form);
        if (!form.valid()) return;

        // quantity must not drop below previous when updating
        if (
          this.bookId &&
          parseInt($(this.selectors.quantityInput).val(), 10) < this.prevQty
        ) {
          form.validate().showErrors({
            quantity: `Not less than ${this.prevQty}`,
          });
          return;
        }

        const payload = {
          title: $(this.selectors.titleInput).val().trim(),
          author: $(this.selectors.authorInput).val().trim(),
          language: $(this.selectors.languageSelect).val(),
          totalCount: parseInt(
            $(this.selectors.quantityInput).val().trim(),
            10
          ),
        };
        const isUpdate = !!this.bookId;

        $.ajax({
          url: isUpdate
            ? `${this.apiUrl}/updateBookDetails`
            : `${this.apiUrl}/addNewBook`,
          type: isUpdate ? "PUT" : "POST",
          data: JSON.stringify(
            isUpdate ? { ...payload, bookId: this.bookId } : payload
          ),
          contentType: "application/json",
          success: () => {
            Swal.fire({
              icon: "success",
              title: isUpdate ? "Book Updated" : "Book Added",
              timer: 2000,
              showConfirmButton: false,
            });
            $(this.selectors.modal).modal("hide");
            this.reset();
            $("#apply_filters").click(); // refresh parent table
            this.dispatchEvent(
              new CustomEvent("book-saved", {
                bubbles: true,
                detail: { updated: isUpdate },
              })
            );
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
      });

      // --------- Reset + Close ----------
      $(this.selectors.resetButton).on("click", () => this.reset());
      $(this.selectors.modal).on("hidden.bs.modal", () => this.reset());
    }

    /** Setup jQuery Validate rules + custom methods */
    initValidation() {
      const form = $(this.selectors.form);

      if (form.data("validator")) {
        form.removeData("validator").removeData("unobtrusiveValidation");
      }

      jQuery.validator.addMethod(
        "pattern",
        function (value, element, param) {
          const re = new RegExp(param);
          return this.optional(element) || re.test(value);
        },
        "Invalid format."
      );

      form.validate({
        ignore: [],
        onkeyup: false,
        rules: {
          title: { required: true, pattern: /^[a-zA-Z0-9 ]+$/, minlength: 2 },
          author: { required: true, pattern: /^[a-zA-Z ]+$/, minlength: 2 },
          language: { required: true },
          quantity: { required: true, pattern: /^[1-9][0-9]*$/ },
        },
        messages: {
          title: {
            required: "Please enter the Title",
            minlength: "Minimum 2 characters",
          },
          author: {
            required: "Please enter the Author",
            minlength: "Minimum 2 characters",
          },
          language: { required: "Please select a language" },
          quantity: {
            required: "Please enter Quantity",
            pattern: "Quantity must be a positive number",
          },
        },
      });
    }

    /** Reset fields + clear validation errors */
    reset() {
      this.bookId = null;
      this.prevQty = 0;
      $(this.selectors.form).trigger("reset");
      if ($(this.selectors.form).data("validator")) {
        $(this.selectors.form).validate().resetForm();
      }

      $(this.selectors.saveButton).text("Save");
      $(this.selectors.modalHeading).text("Add Book");
      $(this.selectors.resetColumn).show();
      $(this.selectors.saveColumn).removeClass("col-12").addClass("col-6");
    }

    /** Opens modal. Accepts data for update or null for add */
    open(data = null) {
      if (data) {
        this.bookId = data.bookId;
        this.prevQty = data.totalCount;
        $(this.selectors.titleInput).val(data.title);
        $(this.selectors.authorInput).val(data.author);
        $(this.selectors.languageSelect).val(data.language.toLowerCase());
        $(this.selectors.quantityInput).val(data.totalCount);
        $(this.selectors.saveButton).text("Update");
        $(this.selectors.modalHeading).text("Update Book");
        $(this.selectors.resetColumn).hide();
        $(this.selectors.saveColumn).removeClass("col-6").addClass("col-12");
      } else {
        this.reset();
      }
      $(this.selectors.modal).modal("show");
    }
  }

  customElements.define("book-add-edit-modal", BookAddEditModal);
}
