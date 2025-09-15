class BookAddEditModal extends HTMLElement {
  constructor() {
    super();
    
    const tmpl = $("#book_add_edit_modal").get(0);
    this.appendChild(tmpl.content.cloneNode(true));

    // Cache jQuery selectors
    this.$modal   = $(this).find("#book_modal");
    this.$title   = $(this).find("#title");
    this.$author  = $(this).find("#author");
    this.$lang    = $(this).find("#language");
    this.$qty     = $(this).find("#quantity");
    this.$heading = $(this).find(".modal-heading-text");
    this.$saveBtn = $(this).find("#save_btn");

    this.bookId   = null;
    this.prevQty  = 0;
  }

  connectedCallback() {
    this.attachEvents();
    console.log("HII")
    $(document).on("click", "#add_new_book", function(){
        console.log("HIO")
        $("#book_modal").modal("show")
    })
  }

  attachEvents() {
    const nameRegex = /^[A-Za-z0-9\s]+$/;
    const numRegex  = /^[0-9]+$/;

    const validateField = (el, regex, errId, msg) => {
      if (!el || el.length === 0) {      // <— guard
    console.warn("Missing element for", errId);
    return false;
  }
      const v = el.val().trim();
      if (!v) { this.showError(errId, "Required Field."); return false; }
      if (regex && !regex.test(v)) { this.showError(errId, msg); return false; }
      this.showError(errId, ""); return true;
    };

    this.$saveBtn.on("click", () => {
      const validTitle  = validateField(this.$title,  nameRegex, "#title_error",   "Only letters/numbers.");
      const validAuthor = validateField(this.$author, nameRegex, "#author_error",  "Only letters/numbers.");
      // const validLang   = validateField(this.$lang,   null,      "#language_error","Select language.");
      let validQty      = validateField(this.$qty,    numRegex,  "#quantity_error","Only numbers.");

      if (this.bookId && parseInt(this.$qty.val(),10) < this.prevQty) {
        this.showError("#quantity_error","Must be ≥ previous count");
        validQty = false;
      }

      if (validTitle && validAuthor && validQty) {
        const payload = {
          title: this.$title.val().trim(),
          author: this.$author.val().trim(),
          language: this.$lang.val(),
          totalCount: parseInt(this.$qty.val().trim(),10)
        };
        const isUpdate = !!this.bookId;
        const ajaxOpt = {
          url: isUpdate
              ? "http://localhost:8080/LibraryManagementSystem/Books/updateBookDetails"
              : "http://localhost:8080/LibraryManagementSystem/Books/addNewBook",
          type: isUpdate ? "PUT" : "POST",
          data: JSON.stringify(isUpdate ? {...payload, bookId: this.bookId} : payload),
          contentType: "application/json",
          success: () => {
            Swal.fire({
              icon: "success",
              title: isUpdate ? "Book Updated" : "Book Added",
              timer: 2000, showConfirmButton: false
            });
            this.$modal.modal("hide");
            this.reset();
            // trigger a custom event so parent page can refresh table
            this.dispatchEvent(new CustomEvent("book-saved", {bubbles:true, detail:{updated:isUpdate}}));
          },
          error: (xhr) => {
            let msg="Something went wrong.";
            if (xhr.responseJSON?.message) msg = xhr.responseJSON.message;
            Swal.fire({icon:"error",title:"Error",text:msg,timer:2000,showConfirmButton:false});
          }
        };
        $.ajax(ajaxOpt);
      }
    });

    $(this).find("#reset_btn").on("click", () => this.reset());
    this.$modal.on("hidden.bs.modal", () => this.reset());
  }

  showError(id,msg){ $(this).find(id).text(msg); }

  reset() {
    this.bookId = null; this.prevQty = 0;
    this.$title.val(""); this.$author.val("");
    this.$lang.val("");  this.$qty.val("");
    this.showError("#title_error",""); this.showError("#author_error","");
    this.showError("#language_error",""); this.showError("#quantity_error","");
    this.$saveBtn.text("Save");
    this.$heading.text("Add Book");
  }

  /**
   * Opens modal.
   * @param {Object|null} data  Pass null for Add, or {bookId,title,author,language,totalCount}
   */
  open(data=null) {
    if (data) {
      this.bookId = data.bookId;
      this.prevQty = data.totalCount;
      this.$title.val(data.title);
      this.$author.val(data.author);
      this.$lang.val(data.language);
      this.$qty.val(data.totalCount);
      this.$saveBtn.text("Update");
      this.$heading.text("Update Book");
    }
    this.$modal.modal("show");
  }
}

customElements.define("book-add-edit-modal", BookAddEditModal);