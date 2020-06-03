import React, { useEffect, useState, ChangeEvent } from "react";
import "./style.css";
import logo from "../../assets/logo.svg";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";

interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface IBGEUFResponse {
	sigla: string;
}

interface IBGECityResponse {
	nome: string;
}

const CreatePoint = () => {
	const [ufs, setUfs] = useState<string[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [cities, setCities] = useState<string[]>([]);
	const [selectedUF, setSelectedUF] = useState("0");
	const [selectedCity, setSelectedCity] = useState("0");
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
		0,
		0,
	]);

	useEffect(() => {
		api.get("items").then((response) => {
			setItems(response.data);
		});
	}, []);
	useEffect(() => {
		axios
			.get<IBGEUFResponse[]>(
				"https://servicodados.ibge.gov.br/api/v1/localidades/estados"
			)
			.then((response) => {
				const ufInitials = response.data.map((uf) => uf.sigla);
				setUfs(ufInitials);
			});
	}, []);

	useEffect(() => {
		if (selectedUF === "0") return;

		axios
			.get<IBGECityResponse[]>(
				`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
			)
			.then((response) => {
				const cityName = response.data.map((city) => city.nome);
				setCities(cityName);
			});
	}, [selectedUF]);

	function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;
		setSelectedUF(uf);
	}
	function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;
		setSelectedCity(city);
	}
	function mapClick(event: LeafletMouseEvent) {
		setSelectedPosition([event.latlng.lat, event.latlng.lng]);
	}

	return (
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta" />
				<Link to="/">
					<FiArrowLeft />
					<span>Voltar para home</span>
				</Link>
			</header>
			<form>
				<h1>
					Cadastro do
					<br /> ponto de coleta
				</h1>
				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>
					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input type="text" name="name" id="name" />
					</div>
					<div className="field-group">
						<div className="field">
							<label htmlFor="email">E-mail</label>
							<input type="email" name="email" id="email" />
						</div>
						<div className="field">
							<label htmlFor="whatsapp">Whatsapp</label>
							<input type="text" name="whatsapp" id="whatsapp" />
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>
					<Map
						center={[-23.5578568, -46.617725]}
						zoom={15}
						onClick={mapClick}
					>
						<TileLayer
							attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						<Marker position={selectedPosition} />
					</Map>
					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>
							<select
								name="uf"
								id="uf"
								onChange={handleSelectUF}
								value={selectedUF}
							>
								<option value="0">Selecione o estado</option>
								{ufs.map((uf) => (
									<option key={uf} value={uf}>
										{uf}
									</option>
								))}
							</select>
						</div>
						<div className="field">
							<label htmlFor="city">Cidade</label>
							<select
								name="city"
								id="city"
								onChange={handleSelectCity}
								value={selectedCity}
							>
								<option value="0">Selecione a cidade</option>
								{cities.map((city) => (
									<option key={city} value={city}>
										{city}
									</option>
								))}
							</select>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend>
						<h2>Itens de coleta</h2>
						<span>Selecione um ou mais itens abaixo</span>
					</legend>
					<ul className="items-grid">
						{items.map((item) => (
							<li key={item.id}>
								<img src={item.image_url} alt={item.title} />
								<span>{item.title}</span>
							</li>
						))}
					</ul>
				</fieldset>
				<button type="submit">Cadastrar ponto de coleta</button>
			</form>
		</div>
	);
};

export default CreatePoint;
