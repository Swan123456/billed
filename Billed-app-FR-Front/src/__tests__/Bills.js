/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import "@testing-library/jest-dom/extend-expect";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import { formatDate, formatStatus } from '../app/format.js';

class MockDatabase {
  list() {
    return Promise.resolve([
      { id: 1, date: '2023-01-15', status: 'pending' },
      { id: 2, date: '2023-02-20', status: 'paid' },
    ]);
  }
}

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const chrono = (a, b) => (a < b ? -1 : 1);
      const datesSorted = [...dates].sort(chrono);
    });
    describe("When I click on the eye icon", () => {
      // overture modal au clique de l'icon eye
      test("A modal should open", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const sampleBills = new Bills({
          document,
          onNavigate,
          localStorage: window.localStorage,
        });
        sampleBills.handleClickIconEye = jest.fn();
        screen.getAllByTestId("icon-eye")[0].click();
        expect(sampleBills.handleClickIconEye).toBeCalled();
      });
      test("Then the modal should display the attached image", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const sampleBills = new Bills({
          document,
          onNavigate,
          localStorage: window.localStorage,
        });
        const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
        $.fn.modal = jest.fn();
        sampleBills.handleClickIconEye(iconEye);
        expect($.fn.modal).toBeCalled();
        expect(document.querySelector(".modal")).toBeTruthy();
      });
    });
    // test handleClickNewBill
    describe("When I click on the new bill button", () => {
      test("I should navigate to new bill page", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "User",
          })
        );
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const mockStore = null;
        const billsBoard = new Bills({
          document,
          onNavigate,
          mockStore,
          localStorage: window.localStorage,
        });
        const newBillBtn = screen.getByTestId("btn-new-bill");
        const handleClickNewBillBtn = jest.fn(billsBoard.handleClickNewBill);
        newBillBtn.addEventListener("click", handleClickNewBillBtn);
        userEvent.click(newBillBtn);
        expect(handleClickNewBillBtn).toHaveBeenCalled();
      });
    });
  });
  describe('Integration Test: getBills', () => {
    it('should return bills with formatted date and status', async () => {
      const mockDatabase = new MockDatabase();
      const billsInstance = new Bills({
        document: document, // Mock document 
        onNavigate: jest.fn(), // Mock onNavigate 
        store: { bills: () => ({ list: () => mockDatabase.list() }) }, // Utilise le mock de la base de données
        localStorage: {} // Mockez localStorage si nécessaire
      });
  
      // Appele de la méthode getBills
      const bills = await billsInstance.getBills();
  
      // Vérifie que les données retournées sont correctes
      expect(bills).toEqual([
        { id: 1, date: formatDate('2023-01-15'), status: formatStatus('pending') },
        { id: 2, date: formatDate('2023-02-20'), status: formatStatus('paid') },
        // Ajoute d'autres assertions en fonction de vos besoins
      ]);
    });
  });
});
