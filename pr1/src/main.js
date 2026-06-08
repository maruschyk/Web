
function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

function fahrenheitToCelsius(f) {
  return ((f - 32) * 5) / 9;
}

function convert(value, unit) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("Значення має бути числом");
  }
  if (unit === "C") return celsiusToFahrenheit(value);
  if (unit === "F") return fahrenheitToCelsius(value);
  throw new Error("Невідома одиниця: використайте 'C' або 'F'");
}

console.log("25°C =", convert(25, "C"), "°F");
console.log("98.6°F =", convert(98.6, "F").toFixed(1), "°C");

module.exports = { celsiusToFahrenheit, fahrenheitToCelsius, convert };
