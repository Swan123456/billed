import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const selectedFile = fileInput.files[0];
    if (selectedFile) {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const filePath = selectedFile.name;
        const fileExtension = filePath.substr(filePath.lastIndexOf('.'));
      if (allowedExtensions.includes(fileExtension)) {
        const fileName = filePath.substring(0, filePath.lastIndexOf('.'));
        const formData = new FormData();
        const email = JSON.parse(localStorage.getItem("user")).email;
        formData.append('file', selectedFile);
        formData.append('email', email);
  
        this.store
          .bills()
          .create({
            data: formData,
            headers: {
              noContentType: true,
            },
          })
          .then(({ fileUrl, key }) => {
            this.billId = key;
            this.fileUrl = fileUrl;
            this.fileName = fileName;
          })
          .catch((error) => console.error(error));
      } else {
        // L'extension du fichier n'est pas autorisée, affiche un message d'erreur
        alert('Veuillez sélectionner un fichier avec une extension .jpg, .jpeg ou .png.');
        // Réinitialise le champ de fichier pour que l'utilisateur puisse sélectionner à nouveau un fichier valide
        fileInput.value = '';
      }
    }
  };
  handleSubmit = (e, bill) => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}