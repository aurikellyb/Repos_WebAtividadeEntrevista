using FI.AtividadeEntrevista.BLL;
using WebAtividadeEntrevista.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using FI.AtividadeEntrevista.DML;

namespace WebAtividadeEntrevista.Controllers
{
    public class ClienteController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Incluir()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Incluir(ClienteModel model)
        {
            BoCliente boCliente = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();

            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }

            if (boCliente.VerificarExistencia(model.CPF))
            {
                Response.StatusCode = 400;
                return Json("O CPF informado já consta em nosso sistema.");
            }

            List<string> beneficiariosDuplicados = model.Beneficiarios
                .GroupBy(b => b.CPF)
                .Where(g => g.Count() >= 2)
                .Select(g => g.Key)
                .ToList();

            if (beneficiariosDuplicados.Any())
            {
                string errorMessage = "Beneficiários com CPFs duplicados: " +
                    string.Join(", ", beneficiariosDuplicados);

                Response.StatusCode = 400;
                return Json(errorMessage);
            }

            Cliente cliente = new Cliente
            {
                CEP = model.CEP,
                Cidade = model.Cidade,
                Email = model.Email,
                Estado = model.Estado,
                Logradouro = model.Logradouro,
                Nacionalidade = model.Nacionalidade,
                Nome = model.Nome,
                Sobrenome = model.Sobrenome,
                Telefone = model.Telefone,
                CPF = model.CPF
            };

            model.Id = boCliente.Incluir(cliente);

            foreach (BeneficiariosModel beneficiarioModel in model.Beneficiarios)
            {
                Beneficiario beneficiario = new Beneficiario
                {
                    Nome = beneficiarioModel.Nome,
                    CPF = beneficiarioModel.CPF,
                    IdCliente = model.Id
                };

                boBeneficiario.Incluir(beneficiario);
            }

            return Json("Cadastro efetuado com sucesso");
        }

        [HttpPost]
        public JsonResult Alterar(ClienteModel model)
        {
            BoCliente boCliente = new BoCliente();
            BoBeneficiario boBeneficiarios = new BoBeneficiario();

            if (!ModelState.IsValid)
            {
                List<string> erros = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }

            if (boCliente.VerificarExistencia(model.CPF) && boCliente.Consultar(model.Id)?.CPF != model.CPF)
            {
                Response.StatusCode = 400;
                return Json("CPF já cadastrado");
            }

            List<Beneficiario> beneficiarios = boBeneficiarios.Listar(model.Id);

            foreach (Beneficiario beneficiario in beneficiarios)
            {
                if (model.Beneficiarios.Any(b => b.CPF == beneficiario.CPF && b.Id != beneficiario.Id))
                {
                    Response.StatusCode = 400;
                    return Json($"Beneficiário com CPF '{beneficiario.CPF}' já cadastrado para este cliente");
                }
            }

            Cliente clienteParaAlterar = new Cliente
            {
                Id = model.Id,
                CEP = model.CEP,
                Cidade = model.Cidade,
                Email = model.Email,
                Estado = model.Estado,
                Logradouro = model.Logradouro,
                Nacionalidade = model.Nacionalidade,
                Nome = model.Nome,
                Sobrenome = model.Sobrenome,
                Telefone = model.Telefone,
                CPF = model.CPF
            };

            boCliente.Alterar(clienteParaAlterar);

            foreach (BeneficiariosModel beneficiarioModel in model.Beneficiarios)
            {
                if (beneficiarioModel.Id != null)
                {
                    Beneficiario beneficiarioExistente = beneficiarios.FirstOrDefault(b => b.Id == beneficiarioModel.Id.Value);

                    if (beneficiarioExistente != null)
                    {
                        Beneficiario beneficiarioParaAlterar = new Beneficiario
                        {
                            Id = beneficiarioModel.Id.Value,
                            Nome = beneficiarioModel.Nome,
                            CPF = beneficiarioModel.CPF,
                            IdCliente = model.Id
                        };

                        boBeneficiarios.Alterar(beneficiarioParaAlterar);
                        beneficiarios.Remove(beneficiarioExistente);
                    }
                }
                else
                {
                    Beneficiario novoBeneficiario = new Beneficiario
                    {
                        Nome = beneficiarioModel.Nome,
                        CPF = beneficiarioModel.CPF,
                        IdCliente = model.Id
                    };

                    boBeneficiarios.Incluir(novoBeneficiario);
                }
            }

            foreach (Beneficiario beneficiario in beneficiarios)
                boBeneficiarios.Excluir(beneficiario.Id);

            return Json("Cadastro alterado com sucesso");
        }

        [HttpGet]
        public ActionResult Alterar(long id)
        {
            BoCliente boCliente = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();

            Cliente cliente = boCliente.Consultar(id);

            if (cliente == null)
                return RedirectToAction("Index", "Cliente");

            List<Beneficiario> beneficiarios = boBeneficiario.Listar(cliente.Id);

            Models.ClienteModel model = new ClienteModel
            {
                Id = cliente.Id,
                CEP = cliente.CEP,
                Cidade = cliente.Cidade,
                Email = cliente.Email,
                Estado = cliente.Estado,
                Logradouro = cliente.Logradouro,
                Nacionalidade = cliente.Nacionalidade,
                Nome = cliente.Nome,
                Sobrenome = cliente.Sobrenome,
                Telefone = cliente.Telefone,
                CPF = cliente.CPF,
                Beneficiarios = beneficiarios.Select(beneficiario => new BeneficiariosModel
                {
                    Id = beneficiario.Id,
                    Nome = beneficiario.Nome,
                    CPF = beneficiario.CPF
                }).ToList()
            };

            return View(model);
        }

        [HttpPost]
        public JsonResult ListaClientes(int indiceInicio = 0, int tamanhoPagina = 0, string ordenacao = null)
        {
            try
            {
                int totalRegistros;
                string campo = null;
                bool crescente = true;

                if (!string.IsNullOrEmpty(ordenacao))
                {
                    string[] partesOrdenacao = ordenacao.Split(' ');
                    campo = partesOrdenacao[0];
                    if (partesOrdenacao.Length > 1)
                        crescente = partesOrdenacao[1].Equals("ASC", StringComparison.InvariantCultureIgnoreCase);
                }

                List<Cliente> clientes = new BoCliente().Pesquisa(indiceInicio, tamanhoPagina, campo, crescente, out totalRegistros);

                return Json(new { Resultado = "OK", Registros = clientes, TotalRegistros = totalRegistros });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = "Ocorreu um erro ao buscar os clientes: " + ex.Message });
            }
        }
    }
}