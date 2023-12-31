/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js";
import Store from "../app/Store";

jest.mock("../app/Store", () => mockStore)

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname});
};

   
describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        localStorage.setItem(
            'user',
            JSON.stringify({
                type: 'Employee'
            })
        )
        Object.defineProperty(window, 'location', {
            value: {
                hash: ROUTES_PATH['NewBill']
            }
        })
    })

    // Test d'intégration POST
   describe('When I submit a new Bill on correct format', () => { 
    test('Then the submit should success', () => { 
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill1 = new NewBill({
       document, onNavigate, localStorage: window.localStorage
      });
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
      const handleSubmit = jest.fn((e) => newBill1.handleSubmit(e))
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();      
     })
     
    test('should fetch bills from mock API POST', async () => { 
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
     })
     test("Then verify the file bill", async() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
         window,
         "localStorage",
         { value: localStorageMock }
      )
      window.localStorage.setItem("user", JSON.stringify({
       type: "Employee",
       email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      const onNavigate = (pathname) => {
       document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
       type: "Employee"
      }))

      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file');

      billFile.addEventListener("change", handleChangeFile);     
      userEvent.upload(billFile, file)
      
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()
     
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);     
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
    describe('When an error occurs', () => { 
        test('should fail with 500 message error', async () => { 
            jest.spyOn(mockStore, "bills")
            Object.defineProperty(
               window,
               'localStorage',
               { value: localStorageMock }
            )
            window.localStorage.setItem('user', JSON.stringify({
             type: 'Employee',
             email: "a@a"
            }))
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create : () =>  {
             return Promise.reject(new Error("Erreur 500"))
            }
          }})
         const html = BillsUI({ error: "Erreur 500" });
         document.body.innerHTML = html;
         const message = await screen.getByText(/Erreur 500/);
         expect(message).toBeTruthy();       })
     })
   })

   describe("When I upload an incorrect file", () => {
    test("Then the upload fail", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const file = screen.getByTestId("file")
      const newBill = new NewBill({
       document,
       onNavigate,
       store: Store,
       localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      fireEvent.change(file, {
        files: [
          new File(["image"], "test.jpg", { type: "image/jpeg" }),
        ]
      })
      expect(file.value).toBe('')
    })

    let newBill;

    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      newBill = new NewBill({
        document,
        onNavigate,
        store: Store,
        localStorage: window.localStorage,
      });
    });
    
    test("Then the upload valid", () => {
      const file = screen.getByTestId("file");
  
      const validImageContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const validImageFile = new File([validImageContent], "test.jpg", { type: "image/jpeg" });
  
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      file.addEventListener("change", handleChangeFile);
  
      fireEvent.change(file, {
        files: [validImageFile],
      });

      expect(handleChangeFile).toHaveBeenCalled();
    });
  })
})

